'use client';

// components
import CopyRight from './CopyRight';
import Disclaimer from './Disclaimer';
import SocialMedia from './SocialMedia';

const index = () => {
  return (
    <footer className="flex items-center justify-center border-t border-gray-200 bg-gray-50 p-[24px] md:p-[48px]">
      <h2 className="sr-only">Footer</h2>
      
      <div className="flex w-full max-w-[1440px] flex-col items-center justify-center gap-[48px]">
        {/* Social Media & Copyright Section */}
        <div className="flex w-full flex-col items-center justify-center gap-[32px] md:flex-row md:justify-between">
          <SocialMedia />
          <CopyRight />
          <Disclaimer />
        </div>
      </div>
    </footer>
  );
};

export default index;
