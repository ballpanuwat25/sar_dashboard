import connection from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// function addDays(dateStr, daysToAdd) {
//   const date = new Date(dateStr);
//   date.setDate(date.getDate() + daysToAdd);
//   const yyyy = date.getFullYear();
//   const mm = (date.getMonth() + 1).toString().padStart(2, '0');
//   const dd = date.getDate().toString().padStart(2, '0');
//   return `${yyyy}-${mm}-${dd}`;
// }

export default async function handler(req, res) {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
    res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
    res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
    res.status(204).end();
    return;
  }

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
      const { id } = req.query;

      let whereStr = '';
      let params = [];
      if (id) {
        whereStr = 'WHERE Id = ?';
        params = [id];
      }

      let [accounts] = await connection.execute(`SELECT * FROM Accounts ${whereStr}`, params);

      if (id) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
        return res.status(200).json(accounts);
      }

      // กรณีไม่มี id ให้ join ข้อมูลเพิ่มเติม
      const [users] = await connection.execute('SELECT * FROM Users');
      const [packages] = await connection.execute('SELECT * FROM Packages');

      const userObj = {};
      for (const user of users) {
        userObj[user.Id] = { userName: user.Username, startDate: user.CreatedDate };
      }

      const packageObj = {};
      for (const _package of packages) {
        packageObj[_package.Id] = { packageName: _package.Name, day: _package.Day };
      }

      for (let acc of accounts) {
        let screens = acc.Screens;

        for (let s of screens) {
          let users = s.users || [];

          for (let u of users) {
            let packageNames = [];

            if (userObj[u.userId]) {
              // const date = userObj[u.userId].startDate.toISOString().split('T')[0];

              // const time = new Date(userObj[u.userId].startDate.toISOString());
              // time.setHours(time.getUTCHours());

              // const pad = (n) => n.toString().padStart(2, '0');
              // const formatted = `${pad(time.getUTCHours())}:${pad(time.getUTCMinutes())}`;

              u.userName = userObj[u.userId].userName;
              // u.startDate = date;
              // u.time = formatted;
              delete u.userId;
            }

            for (let p of u.packageId || []) {
              if (packageObj[p]) {
                packageNames.push(packageObj[p].packageName);

                // const startDate = u.startDate;
                // const daysToAdd = packageObj[p].day;
                // u.endDate = addDays(startDate, daysToAdd);
              }
            }

            u.packageName = packageNames.join(', ');
            delete u.packageId;
          }
        }

        acc.Screens = screens; // เก็บกลับเข้า accounts
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
      return res.status(200).json(accounts);

    } else if (req.method === 'POST') {
      const { Id, Email, NetflixPassword, Screens } = req.body;

      if (!Id || !Email || !NetflixPassword || !Screens) {
        return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน (Id, Email, NetflixPassword, Screens ต้องมี)' });
      }

      const [result] = await connection.execute(
        `INSERT INTO Accounts (Id, Email, NetflixPassword, Screens, CreatedDate, ModifiedDate) VALUES (?, ?, ?, ?, ?, ?)`,
        [Id, Email, NetflixPassword, Screens, formatDate, formatDate]
      );

      return res.status(201).json({ message: 'เพิ่มบัญชีสำเร็จ', insertId: result.insertId });

    } else if (req.method === 'PATCH') {
      const { accountId, updates } = req.body;

      if (!accountId || !updates || typeof updates !== 'object') {
        return res.status(400).json({ error: "Missing or invalid 'accountId' or 'updates' in request body" });
      }

      const fields = [];
      const values = [];

      for (const key in updates) {
        fields.push(`\`${key}\` = ?`);
        values.push(updates[key]);
      }

      fields.push('ModifiedDate = ?');
      values.push(formatDate);

      if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const sql = `UPDATE Accounts SET ${fields.join(', ')} WHERE Id = ?`;
      values.push(accountId);

      const [result] = await connection.execute(sql, values);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Account not found or no changes made' });
      }

      return res.status(200).json({ message: 'Account updated successfully' });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'OPTIONS']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
