import {
  LightBulbIcon,
  DocumentTextIcon,
  CloudIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'AI Assistance',
    description:
      'Leverage the power of AI to help you understand complex topics and generate high-quality notes.',
    icon: LightBulbIcon,
  },
  {
    name: 'Lecture Notes',
    description:
      'Stay organized and on top of your studies with our easy-to-use platform for managing lecture notes.',
    icon: DocumentTextIcon,
  },
  {
    name: 'Upload Recordings',
    description:
      'Upload your recordings and receive premium high-quality notes for better understanding and retention.',
    icon: CloudIcon,
  },
  {
    name: 'Audio to Text',
    description:
      'Effortlessly convert your lecture recordings into text format for easier review and organization.',
    icon: MicrophoneIcon,
  },
];

export default function FeatureSection() {
  return (
    <div className="bg-black p-8 sm:pb-32">
      <div className=" max-w-full">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-bold leading-7 text-indigo-600">
            AI-Powered Note Taking{' '}
          </h2>
          <p className="mt-3 text-3xl font-extrabold leading-9 text-white">
            Never worry about lecture notes again.
          </p>
          <p className="mt-4 text-lg leading-7 text-gray-300">
            Our AI-powered solution simplifies the process of note-taking,
            making it easier than ever to stay organized and focused.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-12">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="space-y-6 p-6 rounded-lg bg-gradient-to-tr from-[#4a1d7c] to-[#1e103d]"
            >
              <div className="mx-auto h-12 w-12 p-2 rounded-full bg-gradient-to-tr from-[#ff80b5] to-[#9089fc]">
                <feature.icon className="h-full w-full text-white" />
              </div>
              <h3 className="text-lg font-semibold leading-7 text-indigo-500">
                {feature.name}
              </h3>
              <p className="text-base leading-6 text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
