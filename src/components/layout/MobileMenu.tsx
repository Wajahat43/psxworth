"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import SocialLinks from "../molecules/SocialLinks";
import { Button } from "../ui/button";

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const menuItemVariants = {
    closed: { opacity: 0, x: 20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <div className="md:hidden">
      <Button
        onClick={toggleMenu}
        className="flex h-10 w-10 flex-col items-center justify-center space-y-1.5 focus:outline-none"
        aria-label="Toggle mobile menu"
        variant="ghost"
        size="icon"
      >
        <motion.span
          animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          className="block h-0.5 w-6 bg-white"
        />
        <motion.span animate={isOpen ? { opacity: 0 } : { opacity: 1 }} className="block h-0.5 w-6 bg-white" />
        <motion.span
          animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
          className="block h-0.5 w-6 bg-white"
        />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 px-6 pt-20 backdrop-blur-md"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="absolute right-6 top-6"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>

            <nav className="flex-1">
              <ul className="flex flex-col space-y-6 text-lg">
                {["Home", "Portfolio", "FAQs", "Contact"].map((item, i) => (
                  <motion.li key={item} custom={i} variants={menuItemVariants} onClick={toggleMenu}>
                    <a
                      href={`/${item.toLowerCase()}`}
                      className="block border-b border-white/10 py-2 transition-colors hover:text-blue-400"
                    >
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="pb-8">
              <SocialLinks />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
