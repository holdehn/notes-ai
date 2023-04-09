import { ReactNode } from 'react';
import Aside from './ui/Aside';
import Navbar from './ui/Navbar';

type Props = {
  children: ReactNode;
};

export default (props: Props) => {
  const { children } = props;
  return (
    <main className="relative max-w-screen-2xl mx-auto">
      <Navbar />

      <div className="lg:flex bg-black">
        <div className="flex-1 overflow-hidden mt-48 mb-12 px-4 md:px-8 lg:mt-28 bg-black">
          {children}
        </div>
      </div>
    </main>
  );
};
