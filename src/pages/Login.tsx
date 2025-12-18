import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Mail,
  Lock,
  ArrowRight,
  Building2,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  // ✅ ФАҚАТ ИН ҶО ИСЛОҲ ШУД
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // POST ба backend
      const res = await axios.post(`${apiUrl}/auth/login`, { email, password });
      const { token, user } = res.data;
       localStorage.setItem("user",JSON.stringify(user))
      // 🔹 Истифодаи login аз context
      login({ token, user });

      toast.success("Воридшавӣ бомуваффақият анҷом ёфт!");
      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Хатогӣ ҳангоми воридшавӣ. Боз кӯшиш кунед!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Қисми чап — ДИЗАЙН ҲАМОН */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary-foreground rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md"
          >
            <div className="relative h-48 mb-8">
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-0 left-1/4 w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
              >
                <GraduationCap className="w-8 h-8" />
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute top-8 right-1/4 w-20 h-20 bg-primary-foreground/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
              >
                <Building2 className="w-10 h-10" />
              </motion.div>

              <motion.div
                animate={{ y: [-8, 12, -8] }}
                transition={{ duration: 4.5, repeat: Infinity }}
                className="absolute bottom-0 left-1/3 w-14 h-14 bg-primary-foreground/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
              >
                <BookOpen className="w-7 h-7" />
              </motion.div>

              <motion.div
                animate={{ y: [5, -15, 5] }}
                transition={{ duration: 5.5, repeat: Infinity }}
                className="absolute bottom-4 right-1/3 w-12 h-12 bg-primary-foreground/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
              >
                <Users className="w-6 h-6" />
              </motion.div>
            </div>

            <h1 className="text-4xl font-bold mb-4">
              Донишгоҳи байналмилалии саёҳи ва соҳибкорӣ
            </h1>

            <p className="text-lg text-primary-foreground/80 mb-8">
              Идоракунии рӯзномаи донишгоҳро осон, зуд ва муосир гардонед.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">2000+ Донишҷӯ</span>
              </div>

              <div className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <Users className="w-4 h-4" />
                <span className="text-sm">89 Омӯзгор</span>
              </div>

              <div className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">156 Фан</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Қисми рост — ФОРМА (ҲАМОН ДИЗАЙН) */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">UniJournal</h2>
              <p className="text-sm text-muted-foreground">
                Системаи идоракунии таълим
              </p>
            </div>
          </div>

          <Card variant="elevated">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-1">Хуш омадед!</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Барои идома ба ҳисоби худ ворид шавед
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Почтаи электронӣ</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Рамз (парол)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Дар ҳоли воридшавӣ..." : "Ворид шудан"}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
