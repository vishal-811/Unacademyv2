import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRef } from "react";
import Navbar from "../components/Navbar";
import { useIsJoinRoomClicked } from "../strore/useRoomJoin";
import { JoinRoomModal } from "../components/JoinRoomModal";

export default function LandingPage() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  const isRoomJoinButtonClick = useIsJoinRoomClicked((state) => state.isJoinRoomClicked);

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-zinc-900 text-zinc-100 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
         {isRoomJoinButtonClick && <JoinRoomModal/>} 
      <motion.div
        ref={targetRef}
        style={{ opacity, scale, y }}
        className="relative z-10 h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8"
      >
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight select-none"
        >
          Elevate Your Learning with
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="block text-blue-400 mt-2 select-none"
          >
            LearnTrack
          </motion.span>
        </motion.h1>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 text-xl sm:text-2xl text-zinc-400 max-w-3xl select-none"
        >
          Unlock your potential with our cutting-edge online education platform.
          Experience seamless learning like never before.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a
              href="/courses"
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium text-lg inline-flex items-center transition-colors duration-300 hover:bg-blue-700"
            >
              Get Started
              <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-zinc-500" />
        </motion.div>
      </motion.div>

      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-zinc-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Why Choose LearnTrack?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Expert Instructors",
                description:
                  "Learn from industry professionals and thought leaders.",
              },
              {
                title: "Flexible Learning",
                description: "Study at your own pace, anytime and anywhere.",
              },
              {
                title: "Interactive Content",
                description:
                  "Engage with dynamic, multimedia-rich course materials.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-xl font-semibold mb-4 text-blue-400">
                  {feature.title}
                </h3>
                <p className="text-zinc-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-xl text-zinc-400 mb-10">
            Join thousands of students already using LearnTrack to achieve their
            goals.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a
              href="/signup"
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium text-lg inline-flex items-center transition-colors duration-300 hover:bg-blue-700"
            >
              Sign Up Now
              <ArrowRight className="ml-2 -mr-1 w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  );
}
