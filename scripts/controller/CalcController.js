class CalcController {
    constructor() {

        // métodos e atributos

        this._audio = new Audio('click.mp3')
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';

        this._locale = 'pt-br'
        this._displayCalcEl = document.querySelector('#display');
        this._dateEl = document.querySelector('#data');
        this._timeEl = document.querySelector('#hora');
        this._operation = []

        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyBoard();
        
    }

    async copyToClickBoard() {
        await navigator.clipboard.writeText(this.displayCalc);

        alert('copiado para a área de transferência!')
    }

    async pastFromClipboard() {
        let text = await navigator.clipboard.readText();
        this.displayCalc = parseFloat(text)
    }
 
    initialize() {
        // a cada segundo, atualize a hora no display da calculadora
        setInterval(() => {
            this.setDisplayDateTime();
        }, 1000)

        this.setLastNumberToDisplay();

        document.querySelectorAll('.btn-ac').forEach( btn => {
            btn.addEventListener('click', e => {
                this.toggleAudio();
                this.playAudio();
            });
        });

    }

    toggleAudio() {

        if (this._audioOnOff == true) {
            this._audioOnOff = false;
        } else {
            this._audioOnOff = true;
        };

        /*Diferentes formas de se fazer isso

        if/else
            if (this._audioOnOff) {
            this._audioOnOff = false;
        } else {
            this._audioOnOff = true;
        };

        if ternário:

        this._audioOnOff = (this._audioOnOff) ? false : true;

        negando:

        this._audioOnOff = !this._audioOnOff;
        */
    };

    playAudio() {
        if(this._audioOnOff) {
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    initKeyBoard() {
        document.addEventListener('keyup', e => {

            this.playAudio();

            switch (e.key) {
                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':
                    this.addOperation(e.key);
                    break;
                    case '-':
                        this.addOperation(e.key);
                        break;
                    case '/':
                        this.addOperation(e.key);
                        break;
                    case '*':
                        this.addOperation(e.key);
                        break;
                    case '%':
                        this.addOperation(e.key)
                        break;
                    case 'Enter':
                    case '=':
                        this.calc();
                        break;
                    case '.':
                    case ',':
                        this.addDot('.');
                        break;
        
        
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        this.addOperation(parseInt(e.key));
                        break;

                    case 'c':
                        if (e.ctrlKey)  this.copyToClickBoard();
                        break;
                    case 'v':
                        if (e.ctrlKey) this.pastFromClipboard();
                        break;
        
                    
            }
        })
    }

    addEventListenerAll(element, events, func) {
        // método criado para manipular mais de um evento(para substituir o addEventListener())
        events.split(' ').forEach(event => {
            element.addEventListener(event, func, false)
        })
    }

    // calcula o resultado da conta
    getResult() {
        try {
            return eval(this._operation.join(''));
        } catch (err) {
           setTimeout(() => {
            this.setError();
           }, 1)
        }
    }

    calc() {

        let lastOperator = '';
        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber]
        }

        if (this._operation.length > 3) {
            lastOperator = this._operation.pop();


            this._lastNumber = this.getResult();

        } else if (this._operation.length == 3) {

            this._lastNumber = this.getLastItem(false);
        }



        let result = this.getResult();

        if (lastOperator == '%') {

            result /= 100

            this._operation = [result];

        } else {


            this._operation = [result];
            if (lastOperator) this._operation.push(lastOperator)
        }

        this.setLastNumberToDisplay();
    }

    getLastOperation() {
        // contar quantos itens o array possui, e tirar um, para pegar o último item. Pois se o index do array se inicia em zero e for até 9. Temos 10 itens. Eu precisaria diminuir 1 para pegar o real index do último
        return this._operation[this._operation.length - 1]
    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    }

    isOperator(value) {
        return (['+', '-', '*', '/', '%'].indexOf(value) > -1);
    }

    pushOperation(value) {
        this._operation.push(value);

        if (this._operation.length > 3) {

            this.calc();
            console.log(this._operation)
        }
    }

    getLastItem(isOperator = true) {

        let lastItem;

        for (let i = this._operation.length - 1; i >= 0; i--) {

            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }

        }

        if (!lastItem) {
            if (lastItem != 0) { lastItem = (isOperator) ? this._lastOperator : this._lastNumber; }
 
        }

        return lastItem;
    }

    // atualizar valor exibido no display
    setLastNumberToDisplay() {
        let lastNumber = this.getLastItem(false);

        // enquanto *i* for igual ou maior a 0, continue repetindo esta ação. Sempre diminuindo de um em um (i--)
        /*for (let i = this._operation.length - 1; i >= 0; i--) {
            if (!this.isOperator(this._operation[i])) {
                lastNumber = this._operation[i];
                break;
            }
        }*/

        if (!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;
    }

    clearAll() {
        // limpar todo o array(a operação)
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = ''
        this.setLastNumberToDisplay();
    }

    cancelEntry() {
        // remover o último item adicionado ao array
        this._operation.pop();

        this.setLastNumberToDisplay();
    }


    addOperation(value) {


        if (isNaN(this.getLastOperation())) {
            // String
            if (this.isOperator()) {
                // trocar operador
                this.setLastOperation(value);

            } else {
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }
        } else {
            //Number

            if (this.isOperator(value)) {
                this.pushOperation(value);
            } else {
                let number = this.getLastOperation().toString() + value.toString();

                this.setLastOperation(number);

                // atualizar display
                this.setLastNumberToDisplay();
            }
        }



    }

    addDot() {
        let lastOperation = this.getLastOperation();

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation('0.');
        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();
    }

    setError() {
        // se for inserido qualquer outro valor na calculadora, retorne 'error'
        this.displayCalc = 'Error'
    }


    execBtn(value) {

        this.playAudio();

        switch (value) {
            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.cancelEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'porcento':
                this.addOperation('%')
                break;
            case 'igual':
                this.calc();
                break;
            case 'ponto':
                this.addDot('.');
                break;


            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;
        }
    }

    initButtonsEvents() {
        let buttons = document.querySelectorAll('#buttons > g, #parts > g');

        buttons.forEach((btn, index) => {
            this.addEventListenerAll(btn, 'click drag', e => {
                let textBtn = btn.className.baseVal.replace('btn-', '');

                this.execBtn(textBtn);
            })

            this.addEventListenerAll(btn, 'mouseover mousedown mouseup', e => {
                btn.style.cursor = 'pointer'
            })
        })
    }

    setDisplayDateTime() {
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: '2-digit',
            month: 'long', year: 'numeric'
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
        return this._timeEl.innerHTML;
    }

    set displayTime(value) {
        return this._timeEl.innerHTML = value;
    }

    get displayDate() {
        return this._dateEl.innerHTML;
    }

    set displayDate(value) {
        return this._dateEl.innerHTML = value;
    }

    get displayCalc() {
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value) {

        if(value.toString().length > 10) {
            this.setError();
            return false;
        }

        this._displayCalcEl.innerHTML = value;
    }

    get currentDate() {
        return new Date();
    }

    set currentDate(value) {
        this._currentDate = value;
    }
}