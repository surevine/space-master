echo "Checking BTB"
ec2-describe-instances i-aab7fce3 | grep -q stop && ec2-start-instances  i-aab7fce3

n=1
echo "Building CAS and LDAP"
INSTANCE=`ec2-run-instances  ami-c37474b7 -n 1 -k "VPC Dev Instance Default" --instance-type m1.small --subnet subnet-a957dcc0 -group sg-c83f22a4 -group sg-cc3f22a0 -f CASnLDAP.txt  | grep INSTANCE | awk '{print $2}'`
export instances_${n}=$INSTANCE
n=`expr $n + 1`

ec2addtag $INSTANCE --tag Name="$* cluster CAS\&LDAP"
CAS=`ec2-describe-instances $INSTANCE | grep -w NIC | awk '{print $7}'`
LDAP=$CAS


echo "Building ORACLE"
INSTANCE=`ec2-run-instances  ami-c37474b7 -n 1 -k "VPC Dev Instance Default" --instance-type m1.small --subnet subnet-a957dcc0 -group sg-c83f22a4 -group sg-cc3f22a0 -d "#!/bin/sh
/usr/bin/wget http://10.66.2.10/btb/btb.sh
if [ $? == 0 ]; then sh /btb.sh setup chat-standalone <<EOF
$CAS
$LDAP
EOF
 fi" | grep INSTANCE | awk '{print $2}'`


export instances_${n}=$INSTANCE
n=`expr $n + 1`
ec2addtag $INSTANCE --tag Name="$* cluster Oracle"
ORACLE=`ec2-describe-instances $INSTANCE | grep -w NIC | awk '{print $7}'`

echo "Building NFS"
INSTANCE=`ec2-run-instances  ami-c37474b7 -n 1 -k "VPC Dev Instance Default" --instance-type m1.small --subnet subnet-a957dcc0 -group sg-c83f22a4 -group sg-cc3f22a0 -f NFS.txt  | grep INSTANCE | awk '{print $2}'`

export instances_${n}=$INSTANCE
n=`expr $n + 1`
ec2addtag $INSTANCE --tag Name="$* cluster NFS"
NFS=`ec2-describe-instances $INSTANCE | grep -w NIC | awk '{print $7}'`


echo "Building Space REPO Master"
INSTANCE=`ec2-run-instances  ami-c37474b7 -n 1 -k "VPC Dev Instance Default" --instance-type m1.small --subnet subnet-a957dcc0 -group sg-c83f22a4 -group sg-cc3f22a0 -f 2NDBOOT.txt  | grep INSTANCE | awk '{print $2}'`

export instances_${n}=$INSTANCE
n=`expr $n + 1`
ec2addtag $INSTANCE --tag Name="$* cluster Master Repo"
MASTER=`ec2-describe-instances $INSTANCE | grep -w NIC | awk '{print $7}'`
MASTER_I=$INSTANCE

echo "Building Space REPO slave1"
INSTANCE=`ec2-run-instances  ami-c37474b7 -n 1 -k "VPC Dev Instance Default" --instance-type m1.small --subnet subnet-a957dcc0 -group sg-c83f22a4 -group sg-cc3f22a0 -f 2NDBOOT.txt  | grep INSTANCE | awk '{print $2}'`

export instances_${n}=$INSTANCE
n=`expr $n + 1`
ec2addtag $INSTANCE --tag Name="$* cluster slave1 Repo"
SLAVE1=`ec2-describe-instances $INSTANCE | grep -w NIC | awk '{print $7}'`
SLAVE1_I=$INSTANCE

echo sleeping for Master server build
sleep 60

ec2-stop-instances $MASTER_I 

while ! ec2-describe-instances $MASTER_I | grep -q stopped ; do echo Waiting for $MASTER to shutdown ; sleep 1; done

ec2-modify-instance-attribute  $MASTER_I --user-data "#!/bin/sh
/usr/bin/wget http://10.66.2.10/btb/btb.sh
if [ $? == 0 ]; then sh /btb.sh setup space-repo <<EOF
$ORACLE
$LDAP
$ORACLE
$NFS:/alf_data
${MASTER}[7800],${SLAVE1}[7800]
$CAS
EOF
fi
"

echo sleeping for slave server build
sleep 60

ec2-stop-instances $SLAVE1_I 

while ! ec2-describe-instances $SLAVE1_I | grep -q stopped ; do echo Waiting for $SLAVE1 to shutdown ; sleep 1; done

ec2-modify-instance-attribute  $SLAVE1_I --user-data "#!/bin/sh
/usr/bin/wget http://10.66.2.10/btb/btb.sh
if [ $? == 0 ]; then sh /btb.sh setup space-repo <<EOF
$ORACLE
$LDAP
$ORACLE
$NFS:/alf_data
${MASTER}[7800],${SLAVE1}[7800]
$CAS
EOF
fi
"

ec2-start-instances $MASTER_I $SLAVE1_I

echo "Building Space Share1"
sed "s/@@REPO_SERVER@@/$MASTER/" SPACE-SHARE.txt | sed "s/@@CAS_SERVER@@/$CAS/" | sed "s/@@CLUSTER@@/$*.sure.vine/" > tmp-space-share1.txt
INSTANCE=`ec2-run-instances  ami-c37474b7 -n 1 -k "VPC Dev Instance Default" --instance-type m1.small --subnet subnet-a957dcc0 -group sg-c83f22a4 -group sg-cc3f22a0 -f tmp-space-share1.txt  | grep INSTANCE | awk '{print $2}'`

export instances_${n}=$INSTANCE
n=`expr $n + 1`
ec2addtag $INSTANCE --tag Name="$* cluster share 1"
SHARE1=`ec2-describe-instances $INSTANCE | grep -w NIC | awk '{print $7}'`

echo "Building Space Share2"
sed "s/@@REPO_SERVER@@/$SLAVE1/" SPACE-SHARE.txt | sed "s/@@CAS_SERVER@@/$CAS/" | sed "s/@@CLUSTER@@/$*.sure.vine/" > tmp-space-share2.txt
INSTANCE=`ec2-run-instances  ami-c37474b7 -n 1 -k "VPC Dev Instance Default" --instance-type m1.small --subnet subnet-a957dcc0 -group sg-c83f22a4 -group sg-cc3f22a0 -f tmp-space-share2.txt  | grep INSTANCE | awk '{print $2}'`

export instances_${n}=$INSTANCE
n=`expr $n + 1`
ec2addtag $INSTANCE --tag Name="$* cluster share 2"
SHARE2=`ec2-describe-instances $INSTANCE | grep -w NIC | awk '{print $7}'`

echo LDAP Server is $LDAP
echo CAS Server is $CAS
echo ORACLE server is $ORACLE
echo NFS server is $NFS
echo Master REPO is $MASTER
echo Slave1 REPO is $SLAVE1
echo Share1 is $SHARE1
echo Share2 is $SHARE2



echo -n "Instance IDs : "
i=1
while [ $i -le $n ]
do
	eval echo -n  \$instances_$i "\ "
	i=`expr $i + 1`
done
echo

