'use client';

// next
import Image from 'next/image';
import Link from 'next/link';

// data
import socialMediaItems from '@/data/social-media.json';

// contexts
import { useTranslation } from '@/contexts/TranslationContext';

const SocialMedia = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center gap-[12px]">
      <h3 className="font-lora text-[clamp(18px,16px_+_0.5vw,20px)] font-semibold text-veryDarkPurple">
        {t('nav_follow_us')}
      </h3>
      <div className="flex items-center justify-center gap-[16px] [&_a]:transition-all [&_a]:duration-300 hover:[&_a]:scale-110 hover:[&_a]:brightness-90">
        {socialMediaItems.map((socialMediaItem, i) => (
          <Link
            href={socialMediaItem.url}
            key={i}
            target="_blank"
            title={socialMediaItem.title}
            className="flex-shrink-0 rounded-full bg-white p-2 shadow-sm hover:shadow-md"
          >
            <Image 
              src={socialMediaItem.image} 
              alt={socialMediaItem.title} 
              width={28} 
              height={28}
              className="object-contain"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SocialMedia;
