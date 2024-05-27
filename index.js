import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { pool } from "./src/config/db.js";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
dotenv.config();
const app = express()
app.use(cors())
app.use(express.json())

const port = 8000;

app.get('/todos/:userEmail', async (req, res) => {
  try {
    const {userEmail} =  req.params
    const todos = await pool.query("SELECT * FROM todos WHERE user_email= $1", [userEmail]);
    return res.status(200).json({
      todos: todos.rows
    })
  } catch (error) {
    res.status(500).json({
      error: error
    })
  }
})


app.post("/todos", async (req, res) => {
  try {
    const id = uuid()
    const { user_email, title, date } = req.body;
    const newTodo = await pool.query("INSERT INTO todos (id, user_email, title, date) VALUES($1, $2, $3, $4)",
      [id, user_email, title, date])

    if (newTodo) {
      res.status(200).json({
        todo: newTodo[0],
        message: "A new todo is created successfully"
      })
    } else {
      res.status(404).json({
        message: "Something went wrong while created new todo"
      })
    }
  } catch (error) {
    res.status(500).json({
      message: error
    })
  }
})


app.delete("/todos/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await pool.query("DELETE FROM todos WHERE id= $1", [id])
    if (deleteTodo) {
      res.status(200).json({
        message: "Todo is deleted successfully"
      })
    } else {
      res.status(404).json({
        message: "Something went wrong while deleting the todo"
      })
    }
  } catch (error) {
    res.status(500).json({
      message: error
    })
  }
})


app.put("/todos/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_email, title, date } = req.body;


    const result = await pool.query(
      "UPDATE todos SET user_email = $1, title = $2, date = $3 WHERE id = $4 RETURNING *",
      [user_email, title, date, id]
    );

    const updatedTodo = result.rows[0];

    if (updatedTodo) {
      res.status(200).json({
        message: "Todo is updated successfully",
        todo: updatedTodo
      });
    } else {
      res.status(404).json({
        message: "Todo not found"
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


app.post("/user/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const saltRounds = 10;


    const hashed_password = await bcrypt.hash(password, saltRounds);


    const createUser = await pool.query(
      "INSERT INTO users (name, email, hashed_password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashed_password]
    );

    if (createUser.rows.length > 0) {
      res.status(200).json({
        email,
        message: "User registered successfully"
      });
    } else {
      res.status(500).json({
        message: "Failed to register user"
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});










app.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].hashed_password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign({ user_id: user.rows[0].id, email: user.rows[0].email }, "secret key", { expiresIn: '1h' });

    res.status(200).json({
      message: "Login successful",
      email,
      token
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


app.listen(port, () => {
  console.log(`app is lestening on the port ${port}`);
})