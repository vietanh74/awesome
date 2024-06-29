export const isNotifyWhenFail = (response: any) => {
  if (response?.data?.success) {
    return false;
  }

  if (response?.config?.offNotify) {
    return false;
  }

  return true;
};

export const jsonDecode = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return null;
  }
};
