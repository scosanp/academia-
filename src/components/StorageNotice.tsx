type StorageNoticeProps = {
  persistent: boolean;
};

export function StorageNotice({ persistent }: StorageNoticeProps) {
  if (persistent) {
    return null;
  }

  return (
    <div className="notice" role="status">
      Браузер не дал доступ к localStorage. Курс работает, но прогресс может не сохраниться после
      закрытия вкладки.
    </div>
  );
}
