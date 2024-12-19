import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  GraduationCap,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });
  const [currentField, setCurrentField] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fields = [
    { name: "username", icon: User, placeholder: "Choose a username" },
    { name: "email", icon: Mail, placeholder: "Enter your email" },
    { name: "password", icon: Lock, placeholder: "Create a password" },
    { name: "role", icon: GraduationCap, placeholder: "Select your role" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRoleChange = (role: string) => {
    setFormData({ ...formData, role });
    setError("");
  };

  const validateField = () => {
    const currentFieldName = fields[currentField].name;
    if (formData[currentFieldName as keyof typeof formData] === "") {
      setError(
        `${
          currentFieldName.charAt(0).toUpperCase() + currentFieldName.slice(1)
        } is required`
      );
      return false;
    }
    if (currentFieldName === "email" && !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (currentFieldName === "password" && formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const nextField = () => {
    if (validateField()) {
      if (currentField < fields.length - 1) {
        setCurrentField(currentField + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
     const res = await axios.post("http://localhost:3000/api/v1/auth/signup",{
        username : formData.username,
        email : formData.email,
        password : formData.password,
        role : formData.role
     })
     if(res.status === 201){
      setIsSuccess(true);
      navigate("/");
     }
    } catch (error) {
      setIsSuccess(false);
    }finally{
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <h1 className="text-5xl font-bold text-center text-zinc-100 mb-8">
          Join <span className="text-blue-500">LearnTrack</span>
        </h1>
        <div className="bg-zinc-800 p-8 rounded-lg shadow-lg relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-1 bg-blue-500"
            initial={{ width: "0%" }}
            animate={{
              width: `${((currentField + 1) / fields.length) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentField}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <label
                  htmlFor={fields[currentField].name}
                  className="block text-lg font-medium text-zinc-300 mb-2"
                >
                  {fields[currentField].name.charAt(0).toUpperCase() +
                    fields[currentField].name.slice(1)}
                </label>
                {fields[currentField].name !== "role" ? (
                  <div className="relative">
                    <input
                      type={
                        fields[currentField].name === "password"
                          ? "password"
                          : "text"
                      }
                      id={fields[currentField].name}
                      name={fields[currentField].name}
                      value={
                        formData[
                          fields[currentField].name as keyof typeof formData
                        ]
                      }
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-zinc-700 text-zinc-100 rounded-md pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-lg"
                      placeholder={fields[currentField].placeholder}
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRoleChange("student")}
                      className={`flex-1 py-3 px-4 rounded-md text-lg font-medium flex items-center justify-center ${
                        formData.role === "student"
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-700 text-zinc-300"
                      }`}
                    >
                      <BookOpen className="mr-2" size={20} />
                      Student
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRoleChange("educator")}
                      className={`flex-1 py-3 px-4 rounded-md text-lg font-medium flex items-center justify-center ${
                        formData.role === "educator"
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-700 text-zinc-300"
                      }`}
                    >
                      <GraduationCap className="mr-2" size={20} />
                      Educator
                    </motion.button>
                  </div>
                )}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2 flex items-center"
                  >
                    <AlertCircle size={14} className="mr-1" /> {error}
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextField}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center text-lg font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  {currentField === fields.length - 1 ? "Sign Up" : "Next"}
                  <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </motion.button>
          </form>
        </div>
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 p-4 bg-green-500 text-white rounded-md flex items-center justify-center"
            >
              <CheckCircle className="mr-2" size={20} />
              <span>Account created successfully as {formData.role}!</span>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-6 text-center text-zinc-400">
          Already have an account?{" "}
          <a href="/signin" className="text-blue-400 hover:underline">
            Log in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
