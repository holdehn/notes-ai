import Link from 'next/link';
import Brand from '../Brand';

export default () => {
  return (
    <header className=" bg-black">
      <nav className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between md:px-8 ">
        <Link href="/">
          <Brand />
        </Link>
      </nav>
    </header>
  );
};
