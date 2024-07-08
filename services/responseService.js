const sendResponse = (res, statusCode, status, message, data) => {
  try {
    const response = {
      status,
      message,
    };

    if (statusCode == 500) {
      response.error = data.message;
    } else {
      response.data = data;
    }

    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.write(JSON.stringify(response));
    res.end();
  } catch (error) {
    console.log("response service -> sendResponse", error);
    throw error;
  }
};

module.exports = { sendResponse };
