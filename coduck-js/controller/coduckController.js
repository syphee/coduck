const fetchQuery = async (query) => {
  console.log(`[QUERY]:${query}\n`);

  const response = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: query,
    }),
  });

  
  console.log(`[RESPONSE]:${JSON.stringify(response)}\n`);

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  const data = await response.json();
  return data.reply;
};

const callGemini = async (query) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  return query;
};

export { fetchQuery, callGemini };