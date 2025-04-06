
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import QRCodeScanner from "@/components/attendance/QRCodeScanner";
import QRCodeGenerator from "@/components/attendance/QRCodeGenerator";
import FaceScanner from "@/components/attendance/FaceScanner";

interface AttendanceModalsProps {
  activeModal: "qr-scanner" | "qr-generator" | "face-scanner" | null;
  onCloseModal: () => void;
}

const AttendanceModals: React.FC<AttendanceModalsProps> = ({
  activeModal,
  onCloseModal
}) => {
  return (
    <>
      <Dialog open={activeModal === "qr-scanner"} onOpenChange={(open) => !open && onCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <QRCodeScanner onClose={onCloseModal} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "qr-generator"} onOpenChange={(open) => !open && onCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <QRCodeGenerator onClose={onCloseModal} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === "face-scanner"} onOpenChange={(open) => !open && onCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <FaceScanner onClose={onCloseModal} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AttendanceModals;
