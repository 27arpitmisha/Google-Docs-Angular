const app = require('express');
const httpServer = require('http').createServer(app);

const mongoose = require('mongoose');
const Document = require ('./document')
mongoose.connect('mongodb://localhost:27017/myDocument', {useNewUrlParser: true,}
);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const io = require('socket.io')(httpServer,{
    cors : true,
    origin : ["*"]
})

const PORT = process.env.PORT || 3000;
const defaultValue = '';

io.on("connection", (socket) =>{
    console.log("user Connected");
    
     socket.on('get-document', async documentID =>{
         const documents = await findOrCreateDocument(documentID)
         socket.join(documentID);
         
         socket.emit(('load-docuemnt'),documents.data);

         socket.on('send-data', (data) => {
            socket.broadcast.to(documentID).emit('recieve-data', data);
         })

         socket.on('save-document', async data=>{
            await Document.findByIdAndUpdate(documentID, {data})
         });

     })            
});


httpServer.listen(PORT, () =>{
    console.log("Connected !")
})

async function findOrCreateDocument(id){
    if(id == null) return

    const document = await Document.findById(id);
    if(document) return document;

    return await Document.create({_id: id, data : defaultValue})
}