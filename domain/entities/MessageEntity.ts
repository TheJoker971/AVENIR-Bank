export class MessageEntity {


    private constructor(
        public readonly id:number,
        public readonly senderId:number,
        public readonly receiverId:number,
        public readonly subject:string,
        public readonly message:string,
        public readonly date:Date=new Date(),
        ){
    }

    public static create(id: number,senderId:number,receiverId:number,subject:string,message:string):MessageEntity{
        return new MessageEntity(id,senderId,receiverId,subject,message);
    }
}