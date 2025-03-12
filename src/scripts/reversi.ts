const theme_row=document.getElementById("theme-row")!.children as HTMLCollectionOf<HTMLInputElement>;
const theme_column=document.getElementById("theme-column")!.children as HTMLCollectionOf<HTMLInputElement>;

export class Board{
  board:Tile[][];
  player:number = 1;

  constructor(tiles:HTMLElement[][]){
    this.board = new Array(8);
    for(let i = 0; i < 8; i++){
      this.board[i] = new Array(8);
      for(let j = 0; j < 8; j++){
        this.board[i][j] = new Tile(tiles[i][j],this);
      }
    }
    this.initialize(tiles);
  }

  initialize(tiles:HTMLElement[][]){
    for(let i = 0; i < 8; i++){
      for(let j = 0; j < 8; j++){
        this.board[i][j].setState(0);
      }
    }
    this.board[3][3].setState(1);
    this.board[3][4].setState(2);
    this.board[4][3].setState(2);
    this.board[4][4].setState(1);
    this.update();
  }

  update(skipped?:boolean){
    this.player = this.player==1?2:1;
    for(let i = 0; i < 8; i++){
      for(let j = 0; j < 8; j++){
        this.board[i][j].setHighlight(false);
        this.check(i,j,this.board[i][j]);
      }
    }
    let flag = false;
    for(let i = 0; i < 8; i++){
      for(let j = 0; j < 8; j++){
        if(this.board[i][j].getState()==0){
          if(this.board[i][j].directions.length>0){
            this.board[i][j].setHighlight(true);
            flag = true;
          }
        }
      }
    }
    if(!flag){
      if(skipped){
        alert("ゲーム終了");
        let white=0;
        let black=0;
        for(let i = 0; i < 8; i++){
          for(let j = 0; j < 8; j++){
            if(this.board[i][j].getState()==1)black++;
            if(this.board[i][j].getState()==2)white++;
          }
        }
        if(white>black){
          alert("白の勝ち");
        }else if(white<black){
          alert("黒の勝ち");
        }else{
          alert("引き分け");
        }
        this.initialize(this.board.map(row=>row.map(tile=>tile.getElement())));
      }
      this.update(true);
    }
  }

  check(x:number,y:number,element:Tile){
    let flag = false;
    element.directions = [];
    if(this.board[x][y].getState()!=0)return false;
    for(let i = 0; i < 8; i++){
      let dx = x;
      let dy = y;
      let count = 0;
      while(true){
        dx += direction[i][0];
        dy += direction[i][1];
        if(dx<0||dx>=8||dy<0||dy>=8||this.board[dx][dy].getState()==0){
          break;
        }
        if(this.board[dx][dy].getState()==this.player){
          if(count>0){
            flag = true;
            element.directions.push(direction[i]);
          }
          break;
        }
        count++;
      }
    }
    return flag;
  }

  reverse(element:HTMLElement){
    let x=Number(element.dataset.position!.split(",")[0]);
    let y=Number(element.dataset.position!.split(",")[1]);
    this.board[x][y].setState(this.player);
    for(let i = 0; i < this.board[x][y].directions.length; i++){
      let dx = x;
      let dy = y;
      while(true){
        dx += this.board[x][y].directions[i][0];
        dy += this.board[x][y].directions[i][1];
        if(dx<0||dx>=8||dy<0||dy>=8||this.board[dx][dy].getState()==this.player){
          break;
        }
        this.board[dx][dy].setState(this.player);
      }
    }
    this.update();
  }
}

const direction:number[][] = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

export class Tile{
  private state:number=0;
  private element:HTMLElement;
  private stone:HTMLElement;
  private board:Board;
  directions:number[][]=[];

  constructor(element:HTMLElement,board:Board){
    let x=Number(element.dataset.position!.split(",")[0]);
    let y=Number(element.dataset.position!.split(",")[1]);
    this.board = board;
    this.element = element;
    this.stone= document.createElement("div");
    this.stone.classList.add("stone");
    element.addEventListener("pointerdown",()=>{
      if(this.directions.length===0)return;
      if(window.confirm(`お題 : ${theme_row.item(x)!.value} ${theme_column.item(y)!.value}\nこのマスに置きますか？`)){
        board.reverse(element);
      }
    })
  }

  setState(state:number){
    this.state = state;
    if(this.element.childElementCount>0)this.element.removeChild(this.stone);
    switch(state){
      case 0:
        break;
      case 1:
        this.stone.classList.remove("white");
        this.stone.classList.add("black");
        this.element.appendChild(this.stone);
        break;
      case 2:
        this.stone.classList.remove("black");
        this.stone.classList.add("white");
        this.element.appendChild(this.stone);
        break;
    }
  }

  setHighlight(highlight:boolean){
    if(highlight){
      this.element.classList.add("highlight");
    }else{
      this.element.classList.remove("highlight");
    }
  }

  getState(){
    return this.state;
  }

  getElement(){
    return this.element;
  }
}