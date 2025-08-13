import connection from "@/lib/db";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // เปลี่ยนได้ตามโดเมนที่อนุญาต
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // ตอบ preflight CORS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
    res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
    res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
  res.setHeader('Content-Type', 'application/json');

  try {
    const nowDate = new Date();
    const localTime = new Date(nowDate.getTime() + 7 * 60 * 60 * 1000);
    const formatDate =
      localTime.getUTCFullYear() +
      '-' +
      String(localTime.getUTCMonth() + 1).padStart(2, '0') +
      '-' +
      String(localTime.getUTCDate()).padStart(2, '0') +
      ' ' +
      String(localTime.getUTCHours()).padStart(2, '0') +
      ':' +
      String(localTime.getUTCMinutes()).padStart(2, '0') +
      ':' +
      String(localTime.getUTCSeconds()).padStart(2, '0');

    if (req.method === 'GET') {
      const id = req.query.id;
      let users;
      if (id) {
        [users] = await connection.execute(`SELECT * FROM Users WHERE Id = ?`, [id]);
      } else {
        [users] = await connection.execute(`SELECT * FROM Users`);
      }
      return res.status(200).json(users);
    }

    if (req.method === 'POST') {
      // รับข้อมูล user จาก body
      const { id, username, ...rest } = req.body;
      if (!id || !username) {
        return res.status(400).json({ error: "Missing required fields: id or username" });
      }

      console.log("formatDate: ", formatDate)

      const [result] = await connection.execute(
        'INSERT INTO Users (Id, Username, CreatedDate, ModifiedDate) VALUES (?, ?, ?, ?)',
        [id, username, formatDate, formatDate]
      );

      return res.status(201).json({ message: "User created", insertId: result.insertId });
    }

    if (req.method === 'PATCH') {
      const { id, username, createdDate, ...rest } = req.body;
      console.log('req.body: ', req.body)
      if (!username) {
        return res.status(400).json({ error: "Nothing to update" });
      }

      // สร้าง dynamic query สำหรับ update เฉพาะ field ที่ส่งมา
      const fields = [];
      const values = [];
      if (username) {
        fields.push('Username = ?');
        values.push(username);
      }

      if(createdDate) {
        fields.push('CreatedDate = ?');
        values.push(createdDate);
      }
      
      fields.push('ModifiedDate = ?');
      values.push(formatDate);
      
      values.push(id);
      const sql = `UPDATE Users SET ${fields.join(', ')} WHERE Id = ?`;
      const [result] = await connection.execute(sql, values);

      return res.status(200).json({ message: "User updated", affectedRows: result.affectedRows });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Missing user id in query" });
      }

      const [result] = await connection.execute(`DELETE FROM Users WHERE Id = ?`, [id]);
      return res.status(200).json({ message: "User deleted", affectedRows: result.affectedRows });
    }

    // ถ้า method อื่นที่ไม่ได้รองรับ
    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
