export const formatResponse = (data: any, message = '', statusCode: number = 0) => {
  return {
    status: statusCode,
    msg: message,
    data
  };
};
