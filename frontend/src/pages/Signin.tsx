import { useState } from "react";
import {
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { RoleType, useRole } from "../strore/useRole";
import { useAuth } from "../strore/useAuth";

export default function SigninPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setUserRole = useRole((state) => state.setRole);
  const login = useAuth((state) => state.login);
  const isLoggedIn = useAuth((state) => state.isLoggedIn);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.role) newErrors.role = "Role selection is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const res = await axios.post(
          "https://unacademy-server.vishalsharma.xyz/api/v1/auth/signin",
          {
            email: formData.email,
            password: formData.password,
            role: formData.role,
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        if (res.status === 200) {
          login();
          const role = res.data.data.role;
          if (role === "instructor") {
            setUserRole(RoleType.instructor);
          } else if (role === "student") {
            setUserRole(RoleType.student);
          }
          navigate("/");
        }
      } catch (error) {
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  function handleLoginGoogle() {
    window.open(
      "https://prawn-intense-crane.ngrok-free.app/api/v1/auth/google"
    );
  }

  async function handleGoogleSignin(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      handleLoginGoogle();
    } catch (error) {
      console.log("Google signin error is", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-bold text-center text-zinc-100 mb-8">
          Welcome to <span className="text-blue-500">LearnTrack</span>
        </h1>
        <div className="bg-zinc-800 p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-zinc-700 text-zinc-100 rounded-md pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  placeholder="Enter your email"
                />
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
                  size={18}
                />
              </div>
              {errors.emailOremail && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.email}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-zinc-700 text-zinc-100 rounded-md pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  placeholder="Enter your password"
                />
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
                  size={18}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.password}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Choose your role
              </label>
              <div className="flex space-x-4">
                <label className="flex-1 flex items-center justify-center bg-zinc-700 rounded-md p-3 cursor-pointer transition-all duration-300 hover:bg-zinc-600">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === "student"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <BookOpen
                    size={18}
                    className={`mr-2 ${
                      formData.role === "student"
                        ? "text-blue-500"
                        : "text-zinc-400"
                    }`}
                  />
                  <span
                    className={
                      formData.role === "student"
                        ? "text-blue-500"
                        : "text-zinc-300"
                    }
                  >
                    Student
                  </span>
                </label>
                <label className="flex-1 flex items-center justify-center bg-zinc-700 rounded-md p-3 cursor-pointer transition-all duration-300 hover:bg-zinc-600">
                  <input
                    type="radio"
                    name="role"
                    value="instructor"
                    checked={formData.role === "instructor"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <GraduationCap
                    size={18}
                    className={`mr-2 ${
                      formData.role === "instructor"
                        ? "text-blue-500"
                        : "text-zinc-400"
                    }`}
                  />
                  <span
                    className={
                      formData.role === "instructor"
                        ? "text-blue-500"
                        : "text-zinc-300"
                    }
                  >
                    instructor
                  </span>
                </label>
              </div>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle size={14} className="mr-1" /> {errors.role}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2" size={18} />
                </>
              )}
            </button>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-800 text-zinc-400">
                  Or continue with
                </span>
              </div>
            </div>
            <button
              onClick={(e) => handleGoogleSignin(e)}
              className="mt-4 w-full bg-zinc-700 text-zinc-200 py-2 px-4 rounded-md hover:bg-zinc-600 transition-colors duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Sign In with Google
            </button>
          </div>
        </div>
        <p className="mt-6 text-center text-zinc-400">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
