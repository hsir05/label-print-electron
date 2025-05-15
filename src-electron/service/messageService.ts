// src\main\service\messageService.ts
import { ipcMain } from "electron";
import { DataSource } from "typeorm";
import { win } from "../main";
import { DataBase } from "./db";

//创建数据查询Modal
export interface MsgListDTO extends ListDTO {
    roomId: number;
}
//列表查询基类
export interface ListDTO {
    pageNum: number;
    pageSize: number;
    sort: number;
}

//实现MessageService
export class MessageService {
    static instance: MessageService;
    dataSource: DataSource;

    //使用单例模式
    static getInstance() {
        if (!this.instance) {
            this.instance = new MessageService();
        }
        return this.instance;
    }

    constructor() {
        //创建数据库
        this.dataSource = new DataBase("message").dataSource;
    }

    //初始化主角进程监听事件
    init() {
        //新增数据监听
        ipcMain.on(
            "create-message",
            async (_event, data: { winViewId: number; val: MessageModel }) => {
                const info = new MessageModel();
                info.roomId = data.val.roomId;
                info.content = data.val.content;
                info.type = data.val.type;
                const res = await this.create(info);
                const win = win.getInstance().getWin(data.winViewId);
                win && win.webContents.send("update-messages", res);
            }
        );

        //获取数据列表监听
        ipcMain.on(
            "get-message",
            async (_event, data: { winViewId: number; params: MsgListDTO }) => {
                const res = await this.getList(data.params);
                const win = win.getInstance().getWin(data.winViewId);
                win && win.webContents.send("get-messages", res);
            }
        );
    }

    //实现新增方法
    async create(message: MessageModel) {
        await this.dataSource.initialize();
        const res = await this.dataSource.manager.save(message);
        await this.dataSource.destroy();
        return res;
    }

    //实现分页查询
    async getList(options: MsgListDTO) {
        await this.dataSource.initialize();
        const skip = options.pageSize * options.pageNum - options.pageSize;
        const sort = options.sort === 2 ? "ASC" : "DESC";
        const listAndCount = await this.dataSource
            .createQueryBuilder(MessageModel, "message")
            .where(`message.roomId = ${options.roomId}`)
            .orderBy("message.id", sort)
            .skip(skip)
            .take(options.pageSize)
            .getManyAndCount();
        await this.dataSource.destroy();
        return { list: listAndCount[0], count: listAndCount[1] };
    }
}
