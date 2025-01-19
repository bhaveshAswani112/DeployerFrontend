"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex flex-col min-h-screen justify-center items-center">
      <div className="text-center">
        <h1 className="text-4xl text-white mb-4 animate-bounce">
          Welcome to My App!
        </h1>
        <p className="text-gray-800 mb-6">
          Ready to deploy your website in minutes? Sign in with GitHub and get started!
        </p>
      </div>

      <button
        onClick={() => signIn("github")}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`text-white text-xl ${
          hovered ? "bg-purple-700" : "bg-purple-500"
        } px-10 py-2 cursor-pointer rounded-lg border-none mb-5 shadow-lg transition-transform transform ${
          hovered ? "scale-105" : ""
        }`}
      >
        Sign In with GitHub
      </button>

      <ul className="text-gray-800 mb-6 list-disc list-inside">
        <li>Seamless GitHub integration for instant deployments</li>
        <li>Monitor deployment status in real-time</li>
        <li>Automatic rollback for failed deployments</li>
        <li>Custom domain support</li>
      </ul>
      <div className="flex space-x-4 mt-6">
        <a
          href="https://twitter.com/yourusername"
          target="_blank"
          className="text-white hover:text-blue-600"
        >
          Twitter
        </a>
        <a
          href="https://github.com/yourusername"
          target="_blank"
          className="text-white hover:text-black"
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/yourusername"
          target="_blank"
          className="text-white hover:text-blue-900"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
}
