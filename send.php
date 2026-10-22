<?php
/**
 * Приём заявок с главной страницы rus-okna.ru.
 * Отправляет письмо менеджеру; файлы сметы прикладываются к письму.
 */
header('Content-Type: application/json; charset=utf-8');

const MAIL_TO    = 'manager180@mail.ru';
const MAIL_FROM  = 'noreply@rus-okna.ru';
const MAX_FILES  = 5;
const MAX_SIZE   = 5 * 1024 * 1024; // 5 МБ на файл
const ALLOWED    = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'rtf', 'txt', 'jpg', 'jpeg', 'png', 'heic'];

function fail($msg, $code = 400) {
	http_response_code($code);
	echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
	exit;
}
function field($key, $max = 1000) {
	$v = isset($_POST[$key]) ? trim((string)$_POST[$key]) : '';
	$v = str_replace(["\r", "\0"], '', $v);
	return mb_substr($v, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('method', 405);
if (field('website') !== '') { echo json_encode(['ok' => true]); exit; } // бот заполнил скрытое поле

$phoneDigits = preg_replace('/\D/', '', field('phone', 40));
if (strlen($phoneDigits) < 10) fail('phone');

$rows = [
	'Форма'       => field('form', 100),
	'Тема'        => field('subject', 200),
	'Имя'         => field('name', 100),
	'Телефон'     => field('phone', 40),
	'Расчёт'      => field('calc', 600),
	'Комментарий' => field('comment', 3000),
	'Страница'    => field('page', 300),
];
$body = '';
foreach ($rows as $k => $v) if ($v !== '') $body .= "$k: $v\n";
$body .= 'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '') . "\nДата: " . date('d.m.Y H:i') . "\n";

// Вложения
$attachments = [];
if (!empty($_FILES['files']) && is_array($_FILES['files']['name'])) {
	$count = count($_FILES['files']['name']);
	if ($count > MAX_FILES) fail('files');
	for ($i = 0; $i < $count; $i++) {
		if ($_FILES['files']['error'][$i] === UPLOAD_ERR_NO_FILE) continue;
		if ($_FILES['files']['error'][$i] !== UPLOAD_ERR_OK) fail('upload');
		if ($_FILES['files']['size'][$i] > MAX_SIZE) fail('size');
		$name = basename($_FILES['files']['name'][$i]);
		$ext  = strtolower(pathinfo($name, PATHINFO_EXTENSION));
		if (!in_array($ext, ALLOWED, true)) fail('type');
		$attachments[] = [
			'name' => preg_replace('/[^\w.\-а-яА-ЯёЁ ]/u', '_', $name),
			'data' => file_get_contents($_FILES['files']['tmp_name'][$i]),
		];
	}
}

$subject = '=?UTF-8?B?' . base64_encode('Заявка с сайта rus-okna.ru — ' . ($rows['Форма'] ?: 'заявка')) . '?=';
$headers = "From: Русские окна <" . MAIL_FROM . ">\r\nMIME-Version: 1.0\r\n";

if ($attachments) {
	$boundary = 'b_' . bin2hex(random_bytes(12));
	$headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"";
	$msg = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
		. chunk_split(base64_encode($body)) . "\r\n";
	foreach ($attachments as $a) {
		$fn = '=?UTF-8?B?' . base64_encode($a['name']) . '?=';
		$msg .= "--$boundary\r\nContent-Type: application/octet-stream; name=\"$fn\"\r\n"
			. "Content-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"$fn\"\r\n\r\n"
			. chunk_split(base64_encode($a['data'])) . "\r\n";
	}
	$msg .= "--$boundary--";
} else {
	$headers .= "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64";
	$msg = chunk_split(base64_encode($body));
}

if (!mail(MAIL_TO, $subject, $msg, $headers)) fail('mail', 500);
echo json_encode(['ok' => true]);
