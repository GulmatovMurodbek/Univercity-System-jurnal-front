import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Save, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';

const apiUrl = import.meta.env.VITE_API_URL;

export default function TeacherProfile() {
  const { toast } = useToast();

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);

  // Санҷиши қувваи парол
  const getPasswordStrength = () => {
    const pwd = passwordData.newPassword;
    if (pwd.length === 0) return 0;
    if (pwd.length < 4) return 1;
    if (pwd.length < 6) return 2;
    if (pwd.length < 8) return 3;
    return 4;
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Хатогӣ",
        description: "Паролҳои нав мувофиқ нестанд!",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 4) {
      toast({
        title: "Хатогӣ",
        description: "Пароли нав бояд ҳадди ақал 4 рамз дошта бошад!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      await axios.post(
        `${apiUrl}/teachers/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Муваффақият!",
        description: "Парол бомуваффақият иваз карда шуд!",
        variant: "default",
      });

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (err) {
      toast({
        title: "Хатогӣ",
        description: err.response?.data?.message || "Пароли кунунӣ нодуруст аст!",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Профили ман"
        description="Идоракунии маълумоти шахсӣ ва амният"
      />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Дизайни замонавӣ ва зебои ивазкунии парол */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Lock className="w-8 h-8" />
                Амнияти ҳисоб
              </CardTitle>
              <p className="text-primary-foreground/80 mt-2">
                Пароли худро мунтазам иваз кунед барои бехатарии беҳтар
              </p>
            </CardHeader>

            <CardContent className="p-8">
              {isChangingPassword ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Пароли кунунӣ */}
                  <div className="space-y-2">
                    <Label className="text-lg">Пароли кунунӣ</Label>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        placeholder="Пароли кунунии худро дохил кунед"
                        className="pr-12 text-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Пароли нав */}
                  <div className="space-y-2">
                    <Label className="text-lg">Пароли нав</Label>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        placeholder="Пароли навро интихоб кунед"
                        className="pr-12 text-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Нишондиҳандаи қувваи парол */}
                    {passwordData.newPassword && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-2 flex-1 rounded-full transition-all ${level <= getPasswordStrength() ? strengthColors[getPasswordStrength() - 1] : 'bg-muted'
                                }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getPasswordStrength() === 1 && "Хеле заиф"}
                          {getPasswordStrength() === 2 && "Заиф"}
                          {getPasswordStrength() === 3 && "Миёна"}
                          {getPasswordStrength() === 4 && "Қавӣ"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Такрори парол */}
                  <div className="space-y-2">
                    <Label className="text-lg">Такрори пароли нав</Label>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        placeholder="Пароли навро дубора нависед"
                        className="pr-12 text-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {passwordData.confirmPassword && (
                        <div className="absolute right-12 top-1/2 -translate-y-1/2">
                          {passwordData.newPassword === passwordData.confirmPassword ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Тугмаҳо */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={handleChangePassword}
                      disabled={loading}
                      size="lg"
                      className="flex-1 shadow-lg"
                    >
                      {loading ? (
                        "Дар ҳолати иҷро..."
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Иваз кардан
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Бекор кардан
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Пароли худро иваз кунед</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Барои амнияти ҳисоби худ, паролро мунтазам иваз кардан тавсия мешавад
                  </p>
                  <Button
                    size="lg"
                    onClick={() => setIsChangingPassword(true)}
                    className="shadow-lg"
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    Иваз кардани парол
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Агар хоҳед, дигар қисматҳои профилро ҳам илова кунед */}
      </div>
    </DashboardLayout>
  );
}