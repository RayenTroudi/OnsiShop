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
    <div className="flex w-full flex-col items-center gap-3 md:items-start md:justify-start">
      <h3 className="text-[20px] font-semibold text-veryDarkPurple">{t('nav_follow_us')}</h3>
      <div className="flex w-full items-center justify-center gap-4 [&_a]:transition-all [&_a]:duration-300 hover:[&_a]:rounded-full hover:[&_a]:shadow-sm hover:[&_a]:brightness-75">
        {socialMediaItems.map((socialMediaItem, i) => (
          <Link
            href={socialMediaItem.url}
            key={i}
            target="_blank"
            title={socialMediaItem.title}
            className="flex-shrink-0"
          >
            <Image src={socialMediaItem.image} alt={socialMediaItem.title} width="33" height="33" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SocialMedia;
