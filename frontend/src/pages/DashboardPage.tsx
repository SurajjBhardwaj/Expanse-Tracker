"use client";

// import ExpenseTracker from "@/components/expense-tracker";
import Header from "@/components/Header";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <div className="min-h-screen w-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <motion.main
        className="flex-1 py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* <ExpenseTracker /> */}
      </motion.main>
    </div>
  );
}
