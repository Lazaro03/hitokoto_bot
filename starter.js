const token = '6626336774:AAE-B9in4SXtazI3hStFNhrZ70ZoadIataQ'
const bot_username = '@Michel1203'
const master_id = 878626783
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
async function handleRequest(request) {
    if (request.method == 'POST') {
        let data = await request.json()
        if (data.message !== undefined) {
            handle_message(data.message)
        } else if (data.inline_query !== undefined) {
            handle_inline(data.inline_query)
        }
    }
    return new Response('ok', { status: 200 })
}
async function handle_message(d) {
    let chat_id = d.chat.id
    let text = d.text || ''
    let otext = text.split(' ')
    if (text[0] == '/') {
        otext[0] = otext[0].replace('/', '').replace(bot_username, '')
        switch (otext[0]) {
            case 'start':
                await tg(token, 'sendmessage', {
                    chat_id: chat_id,
                    text: 'Hello World!'
                })
                break
        }
    }
}
async function handle_inline(d) {
    let inline_query_id = d.id
    let query = d.query
    let offset = d.offset.split('|')
    let res_data = []
    if (offset.length < 2) {
        offset = [inline_query_id, 0]
    }
    offset[1] = parseInt(offset[1])
    res_data.push({
        id: 'test',
        title: 'test',
        description: 'test inline message',
        type: 'article',
        input_message_content: {
            message_text: 'Hello World!' + query
        }
    })
    offset[1]++
    if (res_data.length < 30)
        offset = []
    await tg(token, 'answerInlineQuery', {
        inline_query_id: inline_query_id,
        cache_time: 180,
        results: JSON.stringify(res_data),
        next_offset: offset.join('|')
    })
}

async function tg(token, type, data, n = true) {
    try {
        let t = await fetch('https://api.telegram.org/bot' + token + '/' + type, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        let d = await t.json()
        if (!d.ok && n)
            throw d
        else
            return d
    } catch (e) {
        // Cloudflare workers runtime only 10ms, So error report maybe isn't work in this limit.
        await tg(token, 'sendmessage', {
            chat_id: master_id,
            text: 'Request tg error\n\n' /**+ JSON.stringify(data) + '\n\n' */ + JSON.stringify(e)
        }, false)
        return e
    }
}
