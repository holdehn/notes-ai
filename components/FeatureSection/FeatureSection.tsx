import {
  TvIcon,
  DocumentMagnifyingGlassIcon,
  ChatBubbleOvalLeftIcon,
  BookOpenIcon,
  FilmIcon,
  DocumentTextIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Youtube video Notes',
    description: 'Summarize Youtube videos with ease.',
    icon: TvIcon,
  },
  {
    name: 'PDF summarization',
    description: 'Summarize lengthy PDFs into concise notes.',
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    name: 'Audio Recording summarization',
    description: 'Transcribe and summarize audio recordings.',
    icon: SpeakerXMarkIcon,
  },
  {
    name: 'Book summarization',
    description: 'Get summaries of your favorite books.',
    icon: BookOpenIcon,
  },
  {
    name: 'Movie summarization',
    description: 'Summarize the plot of any movie.',
    icon: FilmIcon,
  },
  {
    name: 'Article/Blog Post summarization',
    description: 'Summarize lengthy articles and blog posts.',
    icon: DocumentTextIcon,
  },
  {
    name: 'Conference talk/ Lecture summarization',
    description: 'Capture the key points from lectures and conference talks.',
    icon: SpeakerWaveIcon,
  },
  {
    name: 'Podcast summarization',
    description: 'Turn lengthy podcasts into brief summaries.',
    icon: ChatBubbleOvalLeftIcon,
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
            Taking lecture notes is so April 2023.
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
