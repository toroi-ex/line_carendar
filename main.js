//デフォのアカウントやないとカレンダーの権限を承認することができないみたい
//違うアカウントのカレンダーを使いたければ、そのアカウントで新しく作る必要あり？

const CALENDAR_ID = '*******@gmail.com'; //カレンダーID

//メッセージテスト関数
function test(){
  var message = getMessage(CALENDAR_ID,'就活');
  Logger.log('今日\n' + message);
}

//今日の予定を送る
//LINE_TOKENは「ファイル」→「プロジェクトのプロパティ」→「スクリプトのプロパティ」→「行の追加」で追加する
function getTodaySchedule() {
  var accessToken = PropertiesService.getScriptProperties().getProperty('LINE_TOKEN'); //LINEのTOKENを取得
  var message = getMessage(CALENDAR_ID,'就活');　//送信するメッセージの作成
  var options =
   {
     'method'  : 'post'
    ,'payload' : 'message=' + message
    ,'headers' : {'Authorization' : 'Bearer '+ accessToken}
    ,muteHttpExceptions:true
   };
  UrlFetchApp.fetch('https://notify-api.line.me/api/notify',options);　//lineのapiと連携する
}

//lineに送るメッセージを作成
function getMessage(calID,str){
  var startDate = new Date();　//今日の日付を取得（時間も同時に取得するため少し遅いかも）
  var content = '';
  //date = new Date(startDate.getYear(),startDate.getMonth(),startDate.getDate()); //年・月・日だけを取得することが可能だが、年がバグることあり
  var head = Utilities.formatDate(startDate,'JST','yyyy-MM-dd') + ' : ' + str + 'の予定\n'; //必要な形に時間を変換
  content = getEvent(calID,startDate);
  if ( isNull(content) ) {
    content = '予定はありません。';
  }
  return head + content;
}

//カレンダーに記載されているイベントを取得
function getEvent(calID,date){
  var calendar = CalendarApp.getCalendarById(calID); //カレンダーを取得
  var events = calendar.getEventsForDay(date); //カレンダーのイベントを配列型で取得
  var line_event = '';
  var start_end = '';
  
  //予定を取得  
  for (var i in events){
    //予定ごとに改行して見やすくする
    if(!isNull(line_event)){
      line_event += '\n';
    }
    var title = events[i].getTitle(); //イベント名
    var eventId = events[i].getId(); //イベントID
    var event = calendar.getEventById(eventId); //イベント時間を取得する用
    var start = time(event.getStartTime());
    var end = time(event.getEndTime());
    if (start === end){
      start_end = '終日';
    }else{
      start_end = start + '~' + end
    }
    line_event += '・' + start_end + '【' + title + '】' + '-';
  }
  return line_event;
}

//時間の表示を変更
function time(str){
  return Utilities.formatDate(str,'JST','HH:mm');
}

//予定がない時
function isNull(event) {
  if ( event=='' || event===null || event===undefined ) {
    return true;
  } else {
    return false;
  }
}