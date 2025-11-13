import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, Star, MapPin } from "lucide-react";

export const HeroBanner = () => {
  const reviews = [
    {
      name: "Asha Handicrafts",
      location: "Jaipur, Rajasthan",
      text: "This platform helped us reach new customers who truly value handmade products!",
      rating: 5,
    },
    {
      name: "EcoGreen Pots",
      location: "Pune, Maharashtra",
      text: "Our eco-friendly pots got so much love from the community. Thank you for the support!",
      rating: 4,
    },
    {
      name: "Threads by Meera",
      location: "Chennai, Tamil Nadu",
      text: "A wonderful experience connecting with local buyers who appreciate authentic work.",
      rating: 5,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-transparent py-20 md:py-28"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-12 left-12 opacity-30"
      >
        <Sparkles className="h-12 w-12 text-primary" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
        className="absolute bottom-12 right-12 opacity-30"
      >
        <ShoppingBag className="h-12 w-12 text-primary" />
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6"
        >
          Discover Local <span className="text-primary">Creativity</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-12"
        >
          Support small businesses across India — explore unique, handmade, and
          eco-friendly products crafted by passionate local sellers.
        </motion.p>

        {/* 🌟 Seller Reviews */}
        <div className="flex flex-col md:flex-row justify-center gap-6 px-4">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.2 }}
              className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl shadow-lg w-full md:w-1/3"
            >
              <div className="flex justify-center mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                “{review.text}”
              </p>

              <div className="flex flex-col items-center">
                <p className="font-semibold text-primary">{review.name}</p>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                  <MapPin className="h-4 w-4 mr-1 text-primary" />
                  {review.location}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Subtle glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background-light/60 dark:from-background-dark/60 to-transparent" />
    </motion.section>
  );
};
