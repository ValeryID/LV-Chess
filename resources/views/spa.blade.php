<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="css/app.css">
        
        <title>chs - SPA</title>

        <script type="text/javascript" src="https://unpkg.com/axios/dist/axios.min.js"></script>
        <script type="text/javascript" src="/js/app.js"></script>
    </head>

    <body>
        <div class='horizontal-layout'>
            <canvas width=600 height=600 id="game_board"></canvas>
            <div class='lobby-list'></div>
            <div class='vertical-layout'>
                <form name='loginForm'>
                    <label>email</label><input name='email' type='text' value='test@mail.com'>
                    <label>password</label><input name='password' type='password' value='testpassword'>
                    <button name="submit_button" type="button">login</button>
                    <input name='responseLabel' type='text' disabled='true'>
                </form>
                <form name='lobbyForm'>
                    <label>lobby</label><input name='lobby' type='text'>
                    <label>hostColor</label><input name='hostColor' type='text' value='w'>
                    <label>public</label><input name='public' type='text' value='true'>
                    <label>timeLimit</label><input name='timeLimit' type='number' min='0' value='900'>
                    <br>
                    <button name="join_button" type="button">join</button>
                    <button name="make_button" type="button">make</button>
                    <button name="start_button" type="button">start</button>
                    <input name='responseLabel' type='text' disabled='true'>
                </form>
                <form name='gameForm'>
                    <label>Game</label><input type='text' name='game' disabled='true'>
                    <input name='responseLabel' type='text' disabled='true'>
                </form>
            </div>
        </div>
        
    </body>
</html>
