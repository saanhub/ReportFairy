import { useState, useEffect } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';

//API Key placed Here!!

const App = () => {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm Report Fairy! Ask me anything!",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [processingData, setProcessingData] = useState(false);

  const handleSendRequest = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsTyping(true);

    try {
      const response = await processMessageToChatGPT([...messages, newMessage]);
      console.log("repsonse?" + response)
      const content = response.choices[0]?.message?.content;
      
      if (message.startsWith("create")) {
        setProcessingData(true);
        setTimeout(async () => {
          const data = await executeSQLQuery(content);
          const responseMessage = `${JSON.stringify(data)}`;
          
          const chatGPTResponse = {
            message: responseMessage,
            sender: "ChatGPT",
          };
          setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
          setProcessingData(false);
        }, 2000);
      } else if (message.startsWith("bar graph ")) {
        const data = await executeSQLQueryForBarGraph(content);
        const chatGPTResponse = {
          sender: "ChatGPT",
        };
        setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
      } else if (message.startsWith("pie chart ")) {
        const data = await executeSQLQueryForPiGraph(content);
        const chatGPTResponse = {
          sender: "ChatGPT",
        };
        setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
      } else {
        if (content) {
          const chatGPTResponse = {
            message: content,
            sender: "ChatGPT",
          };
          setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  async function processMessageToChatGPT(chatMessages) {
    const apiMessages = chatMessages.map((messageObject) => {
      const role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
      return { role, content: messageObject.message };
    });

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        { role: "system", content: "I'm a Student using ChatGPT for learning" },
        ...apiMessages,
      ],
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    });

    return response.json();
  }

  async function executeSQLQuery(content) {
    console.log("debug in data iowarefhsg: " + content);
    const url = "http://127.0.0.1:5000/api/query";

    // Extract SQL query from content
    const startIndex = content.indexOf('```sql') + '```sql'.length;
    const endIndex = content.indexOf('```', startIndex);
    const sqlQuery = content.substring(startIndex, endIndex);
    
    /*let start_index = content.indexOf("'''");
    let end_index = content.indexOf("'''", start_index + 3); // Finding the second occurrence

    // Extract the substring
    let sqlQuery = content.substring(start_index + 3, end_index);*/

    const response = await fetch(url, {
        method: "POST", 
        body: JSON.stringify({message: sqlQuery}),
        headers: {'Content-Type': 'application/json'}
    });
    const responseData = await response.json();
    const fetchedData = JSON.stringify(responseData).replace(/\n/g, ' ');
    const responseMessage = `${fetchedData}`;
    return responseMessage;
}


async function executeSQLQueryForBarGraph(content) {
  console.log("debug in data iowarefhsg: " + content);
  const url = "http://127.0.0.1:5000/api/image/";

  try {
    const response = await fetch(url, {
      method: "GET",
    });
    const imageBlob = await response.blob();
    const imageURL = URL.createObjectURL(imageBlob);

    return imageURL;
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
}

async function executeSQLQueryForPiGraph(content) {
  console.log("debug in data iowarefhsg: " + content);
  const url = "http://127.0.0.1:5000/api/image2/";

  try {
    const response = await fetch(url, {
      method: "GET",
    });
    const imageBlob = await response.blob();
    const imageURL = URL.createObjectURL(imageBlob);

    return imageURL;
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
}



return (
  <div className="App">
    <div style={{ position: "relative", height: "800px", width: "700px" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList
            scrollBehavior="smooth"
            typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
          >
            {messages.map((message, i) => (
              <Message key={i} model={{ ...message }} />
            ))}
            {messages && messages.some((message) => message && message.message && message.message.startsWith("bar graph")) && (
              <img src="http://127.0.0.1:5000/api/image/" alt="" style={{ height: "300px", width: "400px" }} />
            )}
            {messages && messages.some((message) => message && message.message && message.message.startsWith("pie chart")) && (
              <img src="http://127.0.0.1:5000/api/image2/" alt="" style={{ height: "300px", width: "400px" }} />
            )}


          </MessageList>
          <MessageInput placeholder="Send a Message" onSend={handleSendRequest} />
        </ChatContainer>
      </MainContainer>
    </div>
  </div>
);
};

export default App;
