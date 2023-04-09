import { useEffect, useRef, useState } from 'react';

const AvatarMenue = () => {
  const [state, setState] = useState(false);
  const profileRef = useRef();

  const topbar = [{ title: 'Settings', path: '/settings' }];

  return (
    <div
      className="hidden w-10 h-10 outline-none rounded-full ring-offset-2 ring-gray-200 lg:focus:ring-2 lg:block"
      onClick={() => setState(!state)}
    >
      <img
        src="https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg"
        className="w-full h-full rounded-full"
        alt="avatar"
      />
    </div>
  );
};

export default function () {
  const [state, setState] = useState(false);
  const navigation = [
    { title: 'Generate', path: '/generate' },
    { title: 'Saved', path: '/saved' },
  ];

  return (
    <div className="text-base lg:text-sm bg-black">
      <div
        className={`bg-black items-center gap-x-14 px-4 max-w-screen-xl mx-auto lg:flex lg:px-8 lg:static ${
          state ? 'h-full fixed inset-x-0' : ''
        }`}
      >
        <div className="flex items-center justify-between py-3  lg:block">
          <a href="javascript:void(0)">
            <img
              src="https://www.floatui.com/logo.svg"
              width={120}
              height={50}
              alt="Float UI logo"
            />
          </a>
        </div>
        <div
          className={`nav-menu flex-1 pb-28 mt-8 overflow-y-auto max-h-screen lg:block lg:overflow-visible lg:pb-0 lg:mt-0 ${
            state ? '' : 'hidden'
          }`}
        >
          <ul className="items-center space-y-6 lg:flex lg:space-x-6 lg:space-y-0">
            <div className="flex-1 items-center justify-start pb-4 lg:flex lg:pb-0relative" />
            <AvatarMenue />
          </ul>
        </div>
      </div>
      <nav className="border-b">
        <ul className="flex items-center gap-x-3 mx-auto px-4 overflow-x-auto justify-center lg:px-8">
          {navigation.map((item, idx) => {
            return (
              <li
                key={idx}
                className={`py-1 ${
                  idx == 0 ? 'border-b-2 border-indigo-600' : ''
                }`}
              >
                <a
                  href={item.path}
                  className={`block py-2 px-3 rounded-lg text-white hover:text-gray-300 hover:bg-gray-800 duration-150 ${
                    idx == 0 ? 'font-semibold' : ''
                  }`}
                >
                  {item.title}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
