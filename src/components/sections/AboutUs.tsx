'use client';

import { useTranslation } from '@/contexts/TranslationContext';

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <section className="flex items-center justify-center border-t-[1px] border-purple bg-lightPurple py-[48px] md:py-[64px]">
      <h2 className="sr-only">{t('section_about_us_title')}</h2>
      <div className="flex max-w-[95%] flex-col items-center justify-center gap-[32px] text-center md:max-w-[700px]">
        <h3 className="font-lora text-[clamp(28px,18px_+_2vw,40px)] font-semibold text-veryDarkPurple">
          {t('about_title')}
        </h3>
        <p className="max-w-[90%] font-lora text-[clamp(20px,14px_+_2vw,24px)] font-medium leading-relaxed text-darkPurple md:max-w-none md:leading-normal">
          {t('about_description')}
        </p>
        <a href="/about-us" className="btn-very-dark mt-2 text-[clamp(18px,10px_+_2vw,22px)]">
          {t('about_button_text')}
        </a>
      </div>
    </section>
  );
};

export default AboutUs;
