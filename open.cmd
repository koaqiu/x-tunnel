@ECHO OFF
REM e:
REM cd E:\works\NodeJs\x-tunnel\
REM
CD /D %~dp0
node . --ssh www.depoga.net --user dev --key E:\works\DeepSearch\Tools\Order\data\dpj2dev_id_rsa --remote rm-wz97mb4ar75v27x35.mysql.rds.aliyuncs.com --remotePort 3306 --localPort 3306