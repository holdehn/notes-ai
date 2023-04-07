import {
  IconArrowLongRight,
  IconBoxWidget,
  IconLayout,
  // IconBookOpen,
  // IconChat,
} from "@/components/icons";
import { ReactNode } from "react";

type Feature = {
  icon: ReactNode;
  title: string;
  desc: string;
};

const featuresList: Feature[] = [
  {
    icon: <IconBoxWidget />,
    title: "AI-powered tutoring",
    desc: "Get personalized help with your studies using our AI-powered tutoring platform.",
  },
  {
    icon: <IconLayout />,
    title: "Study materials",
    desc: "Access a comprehensive library of study materials, including textbooks, videos, and quizzes.",
  },
  {
    // icon: <IconBookOpen />,
    icon: <IconLayout />,
    title: "Collaborative learning",
    desc: "Connect with other college students and collaborate on projects and assignments.",
  },
  {
    // icon: <IconChat />,
    icon: <IconLayout />,
    title: "24/7 Support",
    desc: "Get help whenever you need it from our team of expert tutors and support staff.",
  },
];

export default () => (
  <section className="py-20 text-gray-600 bg-gray-900">
    <div className="max-w-xl mx-auto text-center" style={{ color: "black" }}>
      <h2 className="text-white text-3xl font-semibold sm:text-4xl">
        Study smarter, not harder
      </h2>
      <p className="mt-3 text-white">
        Our AI-powered education platform helps college students learn more
        effectively and efficiently.
      </p>
    </div>
    <div className="mt-12 max-w-4xl mx-auto">
      <ul className="space-y-6 grid-cols-2 gap-6 sm:grid sm:space-y-0">
        {featuresList.map((item: Feature, idx: number) => (
          <li key={idx}>
            <div className="block group space-y-3 p-4 rounded-lg border bg-blue-400 sm:p-6">
              <div>{item.icon}</div>
              <h3 className="flex items-center gap-x-3 text-white text-xl font-semibold">
                {item.title}
                <IconArrowLongRight className="w-6 h-6" />
              </h3>
              <p className="text-white">{item.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
