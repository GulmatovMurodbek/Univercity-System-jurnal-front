import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ViewTeacherModal({
  open,
  onClose,
  teacher,
}: {
  open: boolean;
  onClose: () => void;
  teacher: any;
}) {
  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-indigo-600 text-white text-lg">
                {teacher.fullName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            Маълумоти устод
          </DialogTitle>
          <DialogDescription className="text-sm">
            Маълумоти пурра дар бораи {teacher.fullName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          {/* Чап */}
          <div className="space-y-3">
            <Info label="Ному насаб" value={teacher.fullName} />
            <Info label="Email" value={teacher.email} />
            <Info label="Факултет" value={teacher.faculty || "—"} />
            <Info
              label="Соатҳои ҳафтаина"
              value={`${teacher.weeklyHours} соат`}
            />
          </div>

          {/* Рост */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Фанҳо</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {teacher.subjects?.length ? (
                  teacher.subjects.map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm">—</span>
                )}
              </div>
            </div>

            <Info
              label="Санаи бақайдгирӣ"
              value={new Date(teacher.createdAt).toLocaleDateString("tg-TJ")}
            />

            <div>
              <Label className="text-xs text-muted-foreground">ID</Label>
              <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                {teacher._id}
              </p>
            </div>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Парол</Label>
          <p className="text-sm font-mono bg-muted p-2 rounded">
            {teacher.password}
          </p>
        </div>

        <div className="flex justify-end mt-6">
          <Button size="sm" variant="outline" onClick={onClose}>
            Пӯшидан
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Info = ({ label, value }: { label: string; value: any }) => (
  <div>
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <p className="text-sm font-medium">{value}</p>
  </div>
);
