import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class MessageModel {
    @PrimaryColumn({ type: "int" })
    id: number | undefined;

    @Column({ type: "int8", nullable: false })
    roomId: number | undefined;

    @Column({ type: "text", nullable: false })
    content: string | undefined;

    @Column({ type: "text", nullable: false })
    type: string | undefined;
}
