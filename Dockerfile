FROM node:18

WORKDIR /app

# คัดลอกแค่ไฟล์ package.json ก่อน เพื่อเร่งการติดตั้ง dependencies
COPY package*.json ./

RUN npm install

# คัดลอกโค้ดทั้งหมดเข้า container
COPY . .

# expose port 3000
EXPOSE 3000

# สั่งรัน dev server พร้อม hot reload
CMD ["npm", "run", "dev"]