import { motion } from 'framer-motion'

export default function MinimalLoading() {
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