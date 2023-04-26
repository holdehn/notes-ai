import React from 'react';
import { UserCircleIcon } from '@heroicons/react/20/solid';

const Activity = ({ type, person, imageUrl, message }: any) => {
  if (type === 'comment') {
    return (
      <div>
        <div className="relative">
          {imageUrl ? (
            <img
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
              src={imageUrl}
              alt=""
            />
          ) : (
            <div className="relative">
              <div>
                <div className="relative px-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                    <UserCircleIcon
                      className="h-5 w-5 text-gray-500"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="text-sm">
            <a href={person.href} className="font-medium text-gray-900">
              {person.name}
            </a>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-700">
          <p>{message}</p>
        </div>
      </div>
    );
  } else if (type === 'assignment') {
    return (
      <div>
        <div>
          <div className="relative px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
              <UserCircleIcon
                className="h-5 w-5 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 py-1.5">
          <div className="text-sm text-gray-500">
            <a href={person.href} className="font-medium text-gray-900">
              {person.name}
            </a>{' '}
            Context Search{' '}
            <span className="whitespace-nowrap">{message.date}</span>
          </div>
        </div>
      </div>
    );
  } else if (type === 'tags') {
    return (
      <div>
        <div>
          <div className="relative px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
              <UserCircleIcon
                className="h-5 w-5 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 py-0">
          <div className="text-sm leading-8 text-gray-500">
            <span className="mr-0.5">
              <a href={person.href} className="font-medium text-gray-900">
                {person.name}
              </a>{' '}
              added topics
            </span>{' '}
            <span className="whitespace-nowrap">{message.date}</span>
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default Activity;
