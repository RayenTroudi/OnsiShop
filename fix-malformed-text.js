const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMalformedText() {
  try {
    console.log('🔧 Fixing malformed about_description...');
    
    // Get current about_description
    const current = await prisma.siteContent.findFirst({
      where: { key: 'about_description' }
    });
    
    if (current) {
      console.log('Current value:', JSON.stringify(current.value));
      
      // Check if it contains the malformed text
      if (current.value.includes('about_button_text')) {
        console.log('✅ Found malformed text, fixing...');
        
        // Clean up the text - remove the button text reference
        const cleanedText = "We are passionate about bringing you the finest clothing at affordable prices. Our curated collection features the latest trends and timeless classics.";
        
        await prisma.siteContent.update({
          where: { id: current.id },
          data: { 
            value: cleanedText,
            updatedAt: new Date()
          }
        });
        
        console.log('✅ Fixed about_description');
        console.log('New value:', cleanedText);
      } else {
        console.log('ℹ️  Text looks clean already');
      }
    }
    
    // Also check for any other malformed content
    const allContent = await prisma.siteContent.findMany();
    console.log('\\n🔍 Checking all content for button text references...');
    
    for (const item of allContent) {
      if (item.value.includes('_button_text') && item.key !== 'about_button_text') {
        console.log(`⚠️  Found malformed content in ${item.key}:`);
        console.log(`   Value: ${JSON.stringify(item.value)}`);
        
        // Auto-fix common cases
        if (item.key.includes('description') && item.value.includes('about_button_text')) {
          const fixed = item.value.replace(/\\n\\nabout_button_text.*$/g, '').trim();
          await prisma.siteContent.update({
            where: { id: item.id },
            data: { value: fixed }
          });
          console.log(`✅ Fixed ${item.key}`);
        }
      }
    }
    
    console.log('\\n✅ Text cleanup completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMalformedText();