/**
 * Константы для toast сообщений
 */

export const TOAST_MESSAGES = {
  // Успешные операции
  SUCCESS: {
    ARTICLE_CREATED: {
      title: "Успех",
      description: "Статья создана",
    },
    ARTICLE_UPDATED: {
      title: "Успех",
      description: "Статья обновлена",
    },
    ARTICLE_DELETED: {
      title: "Успех",
      description: "Статья удалена",
    },
    IMAGE_UPLOADED: {
      title: "Успешно загружено!",
      description: "Изображение добавлено",
    },
    IMAGES_UPLOADED: (count: number) => ({
      title: "Успешно загружено!",
      description: `${count} изображени${count === 1 ? 'е' : count < 5 ? 'я' : 'й'} добавлено`,
    }),
    OFFER_CREATED: {
      title: "Успех",
      description: "Предложение создано",
    },
    OFFER_UPDATED: {
      title: "Успех",
      description: "Предложение обновлено",
    },
    OFFER_DELETED: {
      title: "Успех",
      description: "Предложение удалено",
    },
    COPIED_TO_CLIPBOARD: {
      title: "Скопировано!",
      description: "Текст скопирован в буфер обмена",
    },
  },

  // Ошибки
  ERROR: {
    GENERIC: {
      title: "Ошибка",
      description: "Что-то пошло не так",
      variant: "destructive" as const,
    },
    ARTICLE_NOT_FOUND: {
      title: "Ошибка",
      description: "Статья не найдена",
      variant: "destructive" as const,
    },
    ARTICLE_DELETE_FAILED: {
      title: "Ошибка",
      description: "Не удалось удалить статью",
      variant: "destructive" as const,
    },
    IMAGE_UPLOAD_FAILED: {
      title: "Ошибка",
      description: "Не удалось загрузить изображение",
      variant: "destructive" as const,
    },
    IMAGES_UPLOAD_FAILED: {
      title: "Ошибка",
      description: "Не удалось загрузить изображения",
      variant: "destructive" as const,
    },
    OFFER_SAVE_FAILED: {
      title: "Ошибка",
      description: "Не удалось сохранить предложение",
      variant: "destructive" as const,
    },
    OFFER_DELETE_FAILED: {
      title: "Ошибка",
      description: "Не удалось удалить предложение",
      variant: "destructive" as const,
    },
    AUTH_FAILED: {
      title: "Ошибка",
      description: "Не удалось войти в систему",
      variant: "destructive" as const,
    },
    UNAUTHORIZED: {
      title: "Ошибка доступа",
      description: "У вас нет прав для выполнения этого действия",
      variant: "destructive" as const,
    },
  },
};
