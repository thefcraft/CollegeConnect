import { motion } from 'framer-motion'


export function MinimalLoading() {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
    
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-16 h-16"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 border-t-2 border-gray-300 dark:border-gray-600 rounded-full"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-1 border-t-2 border-gray-400 dark:border-gray-500 rounded-full"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 0.75,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-2 border-t-2 border-gray-600 dark:border-gray-400 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full" />
        </motion.div>
      </motion.div>
      
    </div>
  )
}

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="32"
      height="32" 
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props} // Spread the props to allow passing SVG attributes
    >
      {/* Book representing education */}
      <rect x="4" y="8" width="10" height="16" fill="#4CAF50" rx="2" />
      <path d="M4 10 L14 10" stroke="white" strokeWidth="2" />
      <path d="M4 14 L14 14" stroke="white" strokeWidth="2" />
      
      {/* Briefcase representing business */}
      <rect x="18" y="12" width="10" height="12" fill="#2196F3" rx="2" />
      <path d="M20 12 V10 H26 V12" stroke="#2196F3" strokeWidth="2" />
      
      {/* Connecting line with goofy curve */}
      <path
        d="M14 16 Q18 8 18 16"
        stroke="#FFC107"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 16 16"
          to="360 16 16"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Googly eyes */}
      <circle cx="9" cy="20" r="2" fill="white" />
      <circle cx="9" cy="20" r="1" fill="black">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 9 20"
          to="360 9 20"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="23" cy="20" r="2" fill="white" />
      <circle cx="23" cy="20" r="1" fill="black">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 23 20"
          to="360 23 20"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  )
}