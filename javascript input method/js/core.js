if (document.all && !document.getElementById) {
    document.getElementById = function(id) {
        return document.all[id];
    }
}

var browser="";
function on_load()
{
    if (navigator.appName.indexOf('Microsoft') != -1) {
        browser = 'IE';
    } else if (navigator.appName.indexOf('Netscape') != -1) {
        browser = 'NS';
        document.getElementById("copyAll").value = "选择全文";
    } else {
        browser = 'OP';
    }

    document.getElementById("edit_area").innerHTML ="";
    document.getElementById("input").innerHTML = "";         //输入区域
    document.getElementById("choose").innerHTML = "";       //选择区域

    focu();
}

function focu(){
    var oTextarea = document.getElementById("edit_area");
    oTextarea.focus();
}

var code_field  = "";
var candidates = "";            //汉字候选区
code_len = 12;                   //选择汉字区域的长度

code_table = new Array();

pattern = /[a-z';]+[^a-z';]+/g;
//pattern.compile("[a-z';]+[^a-z';]+", "g");
while (pattern.exec(raw) != null)                   // "raw" is defined in *-table.js
      code_table.push(RegExp.lastMatch);      // 返回最后一个子匹配的结果
//将码表的所有信息加到code_table数组中

word_list = new Array();
left_yinhao1 = false;
left_yinhao2 = false;

ctrl_keydown = false;
right_arrow = false;
cancel_key_event = false;
start_mem = -1;
index_mem = 0;

key_en = "1234567890abcdefghijklmnopqrstuvwxyz";
key_EN = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
key_quan = "1２３４５６７８９０ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ";
key_QUAN = "！＠＃＄％＾＆＊（）ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ";

pattern.compile("[^a-z';]");
function search_code_table(str)       //搜索函数,返回一个start值
{
    var start = -1;
    var low = 0;
    var high = code_table.length - 1;
    var str_len = str.length;
    while (low <= high)
    {
        var mid = Math.floor((low+high)/2);     //向下取整                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     //折半向下取整
        var code = code_table[mid].substr(0, code_table[mid].search(pattern));  //匹配到指定的子字符串,返回它的索引数
        //返回从中间开始找到的第一个汉字到中间的之间字符
        if (code.substr(0,str_len) == str)
        {
            start = mid;
            high = mid-1;
        }
        else if (code.substr(0,str_len) > str) high = mid-1;
        else low = mid+1;
    }
    return(start);
}

function create_word_list(start, index, str) {
    var str_len = str.length;
    var cnt = 1;
    var same_code_words = code_table[start].replace(/[a-z';]+/, '').split(',');
    candidates = "";
    while (cnt <= 10)
    {
        candidates += (cnt % 10) + '.' + same_code_words[index] + "<br />";
        word_list[cnt-1] = same_code_words[index];
        ++index;
        if (index >= same_code_words.length) {
            index = 0;
            ++start;
            if (start >= code_table.length || code_table[start].substr(0, str_len) != str) {
                start = -1;
                break;
            }
            same_code_words = code_table[start].replace(/[a-z';]+/, '').split(',');
        }
        ++cnt;
    }
    if (start > 0) {
        /*if (start_stack.length > 1) {
            candidates += '<PgUp  PgDn>';
        } else {}*/
            candidates += 'PgDn>';
    } else if (start_stack.length > 1) {
        //for (i=cnt+1; i<=10; i++) document.form1.list_area.value += '\n';
        candidates += '<PgUp';
    } else {
        candidates += '';//FIXME';
    }
    start_mem = start;
    index_mem = index;
    document.getElementById("choose").innerHTML = candidates + "";
}

function on_code_change(str) //限制输入的长度
{
    for (i=0;i<=9;i++) {
        word_list[i] = "";  //初始化
    }
    candidates = "";     //候选汉字清零
    start_stack = new Array();
    index_stack = new Array();
    if (str != "")
    {
        start = search_code_table(str);  //search_code_table
        start_stack.push(start);
        index_stack.push(0);
        if (start >= 0)
            create_word_list(start, 0, str);  //create_word_list()
    }
    document.getElementById("input").innerHTML =  str + "";
    document.getElementById("choose").innerHTML =  candidates + "";
}

function insert_char(str)
{
    if (str == "") return;

        switch (browser)
        {
            case 'IE':
                var r = document.selection.createRange();    //document.selection.createRange() 根据当前文字选择返回 TextRange 对象
                r.text=str;
                r.select();
                break;
            case 'NS':
                var obj = document.form1.edit_area;
                var selectionStart = obj.selectionStart;
                var selectionEnd = obj.selectionEnd;
                var oldScrollTop = obj.scrollTop;
                var oldScrollHeight = obj.scrollHeight;        //网页正文全文高
                var oldLen = obj.value.length;

                obj.value = obj.value.substring(0, selectionStart) + str + obj.value.substring(selectionEnd);
                obj.selectionStart = obj.selectionEnd = selectionStart + str.length;
                if (obj.value.length == oldLen) {
                    obj.scrollTop = obj.scrollHeight;
                } else if (obj.scrollHeight > oldScrollHeight) {
                    obj.scrollTop = oldScrollTop + obj.scrollHeight - oldScrollHeight;
                } else {
                    obj.scrollTop = oldScrollTop;
                }
                break;
            default:
                document.form1.edit_area.value += str;
        }
}

function key_down(e) {
    var key = e.which ? e.which : e.keyCode;    //返回键码值
    var key_char = String.fromCharCode(key);

    switch (key) {
        // Backspace
        case 8:
            if (code_field != "")
            {
                var str = code_field;
                code_field = str.substr(0, str.length-1);  //汉字删除后的返回
                on_code_change(code_field);
                cancel_key_event = true;
                return false;
            }
            return true;
        // Tab
        case 9:
            insert_char('　');
            cancel_key_event = true;
            return false;
        // Esc
        case 27:
            clear_all();
            cancel_key_event = true;
            return false;
        // PageUp
        case 33:
        case 189:
        case 37:
            if (code_field != "") {
                if(start_stack.length > 1) {
                    start_stack.pop();
                    index_stack.pop();
                    create_word_list(start_stack[start_stack.length-1], index_stack[index_stack.length-1], code_field);
                }
                cancel_key_event = true;
                return false;
            }
            return true;
        // PageDown
        case 34:
        case 187:
        case 39:
            if (code_field != "") {
                if (start_mem != -1) {
                    start_stack.push(start_mem);
                    index_stack.push(index_mem);
                    for(i=0; i<=9; i++) {
                        word_list[i] = "";
                    }
                    create_word_list(start_mem, index_mem, code_field);
                }
                cancel_key_event = true;
                return false;
            }
            return true;
        // Space
        case 32:
            if (code_field != "") {
                insert_char(word_list[0]);
                code_field = "";
                document.getElementById("code_field").innerHTML = "　";
                candidates = "";
                document.getElementById("list_area").innerHTML = "　";
                cancel_key_event = true;
                return false;
            }
            return true;
        // Enter
        case 13:
            if (code_field!="") {
                cancel_key_event = true;
                return false;
            }
            return true;
        // Ctrl
        case 17:
            ctrl_keydown = true;  //切换中英文
            break;
    }

    if (e.ctrlKey) return true;

    if (/\d/.test(key_char)) {
        if (e.shiftKey) {
            if (document.form1.full_shape.checked || document.form1.ch_en_switch[0].checked) {
                if (document.form1.ch_en_switch[0].checked && key_char=='4') insert_char('￥');
                else {
                    pos = key_EN.indexOf(key_char);
                    insert_char(key_QUAN.substr(pos,1));
                }
                cancel_key_event = true;
                return false;
            }
        } else
        {
            if (code_field != "")
            {
                if (document.form1.ch_en_switch[0].checked)
                {
                    insert_char(word_list[(9+parseInt(key_char))%10]);
                    code_field = "";
                    document.getElementById("input").innerHTML = "";
                    candidates = "";
                    document.getElementById("choose").innerHTML = "";
                    cancel_key_event = true;
                    return false;
                }
            }
        }
        return true;
    }

    if (document.form1.full_shape.checked || document.form1.ch_en_switch[0].checked) {
        if (key == 186 || (key>=188 && key<=192) || (key>=219 && key<=222) )
        {
            if (key == 186) {
                if (document.form1.ch_en_switch[0].checked) {
                    if (e.shiftKey) insert_char('：');
                    else if (code_field == "") insert_char('；');
                    else return true;
                } else {
                    insert_char( e.shiftKey ? '：' : '；' );
                }
            }
            else if (key == 188) insert_char( e.shiftKey ? ((document.form1.ch_en_switch[0].checked)? '《' :'＜') : '，' );
            else if (key == 189) insert_char( e.shiftKey ? '＿' : '－' );
            else if (key == 190) insert_char( e.shiftKey ? ((document.form1.ch_en_switch[0].checked)? '》' :'＞') : (document.form1.ch_en_switch[0].checked)? '。' :'．');
            else if (key == 191) insert_char( e.shiftKey ? '？' : '／' );
            else if (key == 192) insert_char( e.shiftKey ? '～' : '｀' );
            else if (key == 219) insert_char( e.shiftKey ? '｛' : '［' );
            else if (key == 220) insert_char( e.shiftKey ? '｜' : (document.form1.ch_en_switch[0].checked)? '、' :'＼');
            else if (key == 221) insert_char( e.shiftKey ? '｝' : '］' );
            else {
                if (document.form1.ch_en_switch[0].checked) {
                    if (e.shiftKey) insert_char( (left_yinhao2 = !left_yinhao2) ? '“' : '”' );
                    else if (code_field == "") insert_char( (left_yinhao1 = !left_yinhao1) ? '‘' : '’' );
                    else return true;
                } else {
                    insert_char( e.shiftKey ? '＂' : '＇' );
                }
            }
            cancel_key_event = true;
            return false;
        }
        if (document.form1.ch_en_switch[1].checked && key == 187) {
            insert_char( e.shiftKey ? '＋' : '＝' );
            cancel_key_event = true;
            return false;
        }
    }

    if (browser == 'NS') {
        if (document.form1.full_shape.checked || document.form1.ch_en_switch[0].checked) {
            if (key == 59) {
                if (document.form1.ch_en_switch[0].checked) {
                    if (e.shiftKey) insert_char('：');
                    else if (code_field == "") insert_char('；');
                    else return true;
                } else {
                    insert_char( e.shiftKey ? '：' : '；' );
                }
                cancel_key_event = true;
                return false;
            }
            else if (key == 61) {
                if (document.form1.ch_en_switch[1].checked) {
                    insert_char( e.shiftKey ? '＋' : '＝' );
                    cancel_key_event = true;
                    return false;
                }
            }
            else if (key == 109) {
                insert_char( e.shiftKey ? '＿' : '－' );
                cancel_key_event = true;
                return false;
            }
        }
    }

    right_arrow = (key == 39)? true : false;

    return(true);
}

function key_up(e) {
    var key = e.which ? e.which : e.keyCode;
    // Ctrl
    if (key == 17 || key == 57402) {
        if (ctrl_keydown == true) {
            if (document.form1.ch_en_switch[0].checked) {
                document.form1.ch_en_switch[1].checked = true;
                clear_all();
            }
            else document.form1.ch_en_switch[0].checked = true;
        }
    }
    return true;
}

function highlight_copy() {
    if(document.form1.edit_area.value == "")
        window.alert("文字区域为空");
    else
    {
    if (browser == 'IE') {
        str_len = document.form1.edit_area.value.length;
        document.form1.edit_area.value += '\n------------------\n';
        range = document.form1.edit_area.createTextRange();   // 创建对象range用来改变对象文本的一部分值
        range.execCommand("Copy");                             // COPY命令是将当前选中区复制到剪贴板。点击文本框时，复制文本框里面的内容.
        //document.form1.edit_area.value = document.form1.edit_area.value.substr(0,str_len);
    }
    else if (document.form1.edit_area.value.indexOf('JustInput.com') == -1) {
        document.form1.edit_area.value += '\n------------------\n';
    }
    document.form1.edit_area.select(); // 全选区域内文字
  }
}

function clear_all()     //清空汉字选项
{
    code_field = "";
    document.getElementById("input").innerHTML = "";
    candidates = "";
    document.getElementById("choose").innerHTML = "";
}

function clear_words_all(){
    document.form1.edit_area.value = "";
}

function key_press(e) {
    var key = e.which ? e.which : e.keyCode;   //键码
    var key_char = String.fromCharCode(key);  //取字符码

    if (browser == 'NS' || browser == 'OP') {
        if (cancel_key_event) {
            cancel_key_event = false;
            return false;
        }
    }
    if (e.ctrlKey) return true;  // ctrl键按下

    if (/[A-Z]/.test(key_char)) // 大写A-Z
    {
        if (document.form1.ch_en_switch[1].checked)  //当英文被选时
        {
            if (document.form1.full_shape.checked)    //全角被选中
            {
                pos = key_EN.indexOf(key_char)   // 记录按下的大写键的在ken-EN位置,
                insert_char(key_QUAN.substr(pos,1));  //从pos位置开始读一个字符   ||  把大写的字母换成全角的大写
                return false;
            }
            return true;
        }
        else key_char = key_char.toLowerCase(); //英文和全角都没有被选中时讲大写改为小写
    }

    if (/[a-z';]/.test(key_char) && !right_arrow)
    //是小写a-z
    {
        if (document.form1.ch_en_switch[1].checked)  //当小写英文被选时
        {
            if (document.form1.full_shape.checked)  //全角被选中
            {
                pos = key_en.indexOf(key_char)
                insert_char(key_quan.substr(pos,1));//小写全角
                return false;
            }
            return true;
        }
        else {
            if (code_field.length < code_len)  //选择长度
            {
                code_field += key_char;
                on_code_change(code_field);
            }
            return false;
        }
    }

    if (browser == 'NS' && (key == 47 || key == 63)) {
        if (document.form1.ch_en_switch[0].checked || document.form1.full_shape.checked) //中文或者全角选中
            return false;
    }
    return true;
}
