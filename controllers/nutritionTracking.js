const request = require("request");

// Controller function to get nutrition information based on a query
async function getNutrition(req, res) {
  const query = req.query.query || "1lb brisket and fries"; // Default query if not provided

  request.get(
    {
      url: `https://api.api-ninjas.com/v1/nutrition?query=${query}`,
      headers: {
        "X-Api-Key": "DHoqfZnv4xBulUZFNOtsTw==y19ZGOURUBlC6Par",
      },
    },
    function (error, response, body) {
      if (error) {
        console.error("Request failed:", error);
        return res.status(500).json({ error: "Request failed" });
      } else if (response.statusCode !== 200) {
        console.error("Error:", response.statusCode, body);
        return res
          .status(response.statusCode)
          .json({ error: `Error: ${response.statusCode}`, details: body });
      } else {
        try {
          const parsedBody = JSON.parse(body);
          res.json(parsedBody);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          res.status(500).json({ error: "Error parsing response" });
        }
      }
    }
  );
}

module.exports = { getNutrition };
