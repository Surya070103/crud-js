const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

let users = [
    { id: 1, name: "Rahul", age: 24 },
    { id: 2, name: "Priya", age: 22 }
];

// Send JSON response
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });

    res.end(JSON.stringify(data));
}

// Get request body
function getRequestBody(req) {
    return new Promise((resolve, reject) => {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            try {
                const data = JSON.parse(body);
                resolve(data);
            } catch (error) {
                reject(error);
            }

        });
    });
}

const server = http.createServer(async (req, res) => {

    if (req.method === "OPTIONS") {
        sendJson(res, 204, null);
        return;
    }

    // =========================
    // GET ALL USERS
    // =========================
    if (req.method === "GET" && req.url === "/users") {

        sendJson(res, 200, users);
    }

    // =========================
    // CREATE USER
    // =========================
    else if (req.method === "POST" && req.url === "/users") {

        try {

            const data = await getRequestBody(req);

            const newUser = {
                id: users.length ? Math.max(...users.map(user => user.id)) + 1 : 1,
                name: data.name,
                age: Number(data.age)
            };

            users.push(newUser);

            sendJson(res, 201, {
                message: "User created successfully",
                user: newUser
            });

        } catch (error) {

            sendJson(res, 400, {
                message: "Invalid data"
            });
        }
    }

    // =========================
    // UPDATE USER
    // =========================
    else if (
        req.method === "PUT" &&
        req.url.startsWith("/users/")
    ) {

        try {

            const id = Number(req.url.split("/")[2]);

            const data = await getRequestBody(req);

            const user = users.find(user => user.id === id);

            if (!user) {

                sendJson(res, 404, {
                    message: "User not found"
                });

                return;
            }

            user.name = data.name;
            user.age = Number(data.age);

            sendJson(res, 200, {
                message: "User updated successfully",
                user: user
            });

        } catch (error) {

            sendJson(res, 400, {
                message: "Invalid data"
            });
        }
    }

    // =========================
    // DELETE USER
    // =========================
    else if (
        req.method === "DELETE" &&
        req.url.startsWith("/users/")
    ) {

        const id = Number(req.url.split("/")[2]);

        const index = users.findIndex(user => user.id === id);

        if (index === -1) {

            sendJson(res, 404, {
                message: "User not found"
            });

            return;
        }

        const deletedUser = users.splice(index, 1);

        sendJson(res, 200, {
            message: "User deleted successfully",
            user: deletedUser[0]
        });
    }

    // =========================
    // SERVE HTML
    // =========================
    else if (req.method === "GET" && req.url === "/") {

        const filePath = path.join(__dirname, "index.html");

        fs.readFile(filePath, "utf8", (error, data) => {

            if (error) {

                res.writeHead(500, {
                    "Content-Type": "text/plain"
                });

                res.end("Error loading index.html");

                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(data);
        });
    }

    // =========================
    // 404
    // =========================
    else {

        sendJson(res, 404, {
            message: "Route not found"
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});