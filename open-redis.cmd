@ECHO OFF
REM e:
REM cd E:\works\NodeJs\x-tunnel\
REM
CD /D %~dp0
@node . --ssh www.depoga.net --user dev --key E:\works\DeepSearch\Tools\Order\data\dpj2dev_id_rsa --remote r-wz942201d75156c4.redis.rds.aliyuncs.com --remotePort 6379 --localPort 6379