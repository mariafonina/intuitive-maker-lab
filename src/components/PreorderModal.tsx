import { useState } from "react";
import { X, Check } from "lucide-react";

interface PreorderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreorderModal = ({ isOpen, onClose }: PreorderModalProps) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    let phoneNumber = value.replace(/[^\d]/g, "");

    if (phoneNumber.startsWith("8")) {
      phoneNumber = "7" + phoneNumber.substring(1);
    }

    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 1) return "+";

    let formatted = "+";
    if (phoneNumberLength > 0) {
      formatted += phoneNumber.substring(0, 1);
    }
    if (phoneNumberLength > 1) {
      formatted += ` ${phoneNumber.substring(1, 4)}`;
    }
    if (phoneNumberLength > 4) {
      formatted += ` ${phoneNumber.substring(4, 7)}`;
    }
    if (phoneNumberLength > 7) {
      formatted += ` ${phoneNumber.substring(7, 9)}`;
    }
    if (phoneNumberLength > 9) {
      formatted += ` ${phoneNumber.substring(9, 11)}`;
    }
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({ name: "", email: "", phone: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      onClick={handleClose}
    >
      <div
        className={`bg-background rounded-2xl shadow-xl w-full max-w-md relative transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {!isSuccess ? (
          <div className="p-8">
            <h3 className="text-xl font-bold text-foreground text-center">
              Присоединяйтесь к предзаписи
            </h3>
            <p className="text-center text-muted-foreground mt-2 text-sm">
              <strong>21 октября в 12:00 мск</strong> получите первым смс и e-mail со спецпредложением на
              короткое обучение вайбкодингу в честь Дня рождения Мари.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Ваше имя
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-lg shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-background"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Ваш e-mail
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-lg shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-background"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                  Ваш номер телефона
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="+7 999 123 45 67"
                  required
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-lg shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-background"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
              >
                Отправить
              </button>
            </form>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mt-4">Спасибо!</h3>
            <p className="text-muted-foreground mt-2">
              <strong>21 октября в 12:00 мск</strong> вам придет письмо и sms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
