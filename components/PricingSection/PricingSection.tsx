import { CheckIcon } from '@heroicons/react/20/solid';

const includedFeatures = [
  'Generate Notes',
  'Live Assistant',
  'Research',
  'Chat with your Data',
];

const featureDescriptions = {
  'Generate Notes':
    'Effortlessly create comprehensive notes from any content, making studying and organization a breeze.',
  'Live Assistant':
    'Get real-time assistance from our AI-powered live assistant, designed to help you with any educational query.',
  Research:
    'Quickly access a wealth of knowledge and resources to enhance your understanding of any subject.',
  'Chat with your Data':
    'Engage in interactive conversations with your data, allowing for an innovative learning experience.',
};

export default function PricingSection() {
  return (
    <div className="bg-gradient-to-br from-[#3b0764] via-[#1e1b4b] to-[#500724] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Transform Your Learning Experience
          </h2>
          <p className="mt-6 text-lg leading-8 text-white">
            Empower your educational journey with our suite of AI-driven tools
            designed to help you learn faster, retain more, and achieve your
            academic goals.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gradient-to-br from-[#4a044e] via-[#4c0519] to-[#500724] sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              Personalized Learning Membership
            </h3>
            <p className="mt-6 text-base leading-7 text-white">
              Unlock the full potential of your education with our personalized
              membership, offering cutting-edge features tailored to your unique
              learning needs.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-white">
                What’s included
              </h4>
              <div className="h-px flex-auto bg-white/50" />
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-white sm:grid-cols-2 sm:gap-6"
            >
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon
                    className="h-6 w-5 flex-none text-white"
                    aria-hidden="true"
                  />
                  {/*@ts-ignore*/}
                  {feature} - {featureDescriptions[feature]}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-opacity-30 bg-white/10 py-10 text-center ring-1 ring-inset ring-white/10 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-white">
                  Simply monthly pricing
                </p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-white">
                    $8
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-white">
                    USD
                  </span>
                </p>
                <a
                  href="#"
                  className="mt-10 block w-full rounded-md bg-[#3F83F8] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#2C6BEE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F83F8]"
                >
                  Get access
                </a>
                <p className="mt-6 text-xs leading-5 text-white">
                  Annual fee starting as low as $6.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
