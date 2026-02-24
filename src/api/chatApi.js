import axios from "axios";

export async function chatApi(message) {
  const res = await axios.post("http://localhost:8080/testChatSend", { //초기세팅
    message: message,
  });
  console.log(res);
  return res.data;
}